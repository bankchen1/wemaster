import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { createObjectCsvWriter } from 'csv-writer'
import * as ExcelJS from 'exceljs'
import * as fs from 'fs'
import * as path from 'path'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

@Processor('message')
export class MessageProcessor {
  @Process('export')
  async handleExport(job: Job) {
    const { messages, format, exportPath } = job.data

    try {
      switch (format.toLowerCase()) {
        case 'csv':
          await this.exportToCsv(messages, exportPath)
          break
        case 'xlsx':
          await this.exportToExcel(messages, exportPath)
          break
        case 'txt':
          await this.exportToText(messages, exportPath)
          break
        default:
          throw new Error('Unsupported format')
      }

      return { exportPath }
    } catch (error) {
      console.error('Export failed:', error)
      throw error
    }
  }

  private async exportToCsv(messages: any[], filePath: string) {
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'time', title: '时间' },
        { id: 'sender', title: '发送者' },
        { id: 'content', title: '内容' },
        { id: 'type', title: '类型' }
      ]
    })

    const records = messages.map(message => ({
      time: format(
        new Date(message.createdAt),
        'yyyy-MM-dd HH:mm:ss',
        { locale: zhCN }
      ),
      sender: message.sender.name,
      content: message.content,
      type: message.type
    }))

    await csvWriter.writeRecords(records)
  }

  private async exportToExcel(
    messages: any[],
    filePath: string
  ) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('聊天记录')

    // 设置列
    worksheet.columns = [
      { header: '时间', key: 'time', width: 20 },
      { header: '发送者', key: 'sender', width: 15 },
      { header: '内容', key: 'content', width: 50 },
      { header: '类型', key: 'type', width: 10 }
    ]

    // 添加数据
    messages.forEach(message => {
      worksheet.addRow({
        time: format(
          new Date(message.createdAt),
          'yyyy-MM-dd HH:mm:ss',
          { locale: zhCN }
        ),
        sender: message.sender.name,
        content: message.content,
        type: message.type
      })
    })

    // 设置样式
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    await workbook.xlsx.writeFile(filePath)
  }

  private async exportToText(
    messages: any[],
    filePath: string
  ) {
    const content = messages
      .map(
        message =>
          `[${format(
            new Date(message.createdAt),
            'yyyy-MM-dd HH:mm:ss',
            { locale: zhCN }
          )}] ${message.sender.name}: ${message.content}`
      )
      .join('\n')

    await fs.promises.writeFile(filePath, content, 'utf8')
  }

  @Process('cleanup')
  async handleCleanup(job: Job) {
    const { olderThan } = job.data
    const directory = path.join(process.cwd(), 'temp')

    try {
      const files = await fs.promises.readdir(directory)

      for (const file of files) {
        const filePath = path.join(directory, file)
        const stats = await fs.promises.stat(filePath)

        if (
          stats.isFile() &&
          Date.now() - stats.mtime.getTime() >
            olderThan
        ) {
          await fs.promises.unlink(filePath)
        }
      }
    } catch (error) {
      console.error('Cleanup failed:', error)
      throw error
    }
  }
}
