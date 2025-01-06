import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { ConfigService } from '@nestjs/config';
import { BlogPost, SEOMetadata } from '../types/content';

@Injectable()
export class ContentGenerationService {
  private openai: OpenAI;
  private readonly systemPrompt = `You are an expert content creator for an online tutoring platform. 
  Create engaging, informative, and SEO-optimized content that helps both students and tutors.`;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async generateBlogPost(topic: string, targetKeywords: string[]): Promise<BlogPost> {
    const prompt = `Write a comprehensive blog post about "${topic}".
    Target keywords: ${targetKeywords.join(', ')}
    Include: introduction, main points, practical tips, and conclusion.
    Format: markdown`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    return this.formatBlogPost(completion.choices[0].message.content, topic);
  }

  async generateSEOMetadata(content: string): Promise<SEOMetadata> {
    const prompt = `Generate SEO metadata for the following content:
    ${content.substring(0, 500)}...
    Include: title (max 60 chars), description (max 160 chars), keywords (10-15)`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    });

    return this.parseSEOMetadata(completion.choices[0].message.content);
  }

  async generateSocialMediaPost(blogPost: BlogPost): Promise<string> {
    const prompt = `Create an engaging social media post about this blog article:
    Title: ${blogPost.title}
    Key points: ${blogPost.summary}
    Include: hook, value proposition, call-to-action
    Max length: 280 characters`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
    });

    return completion.choices[0].message.content;
  }

  async generateEmailNewsletter(posts: BlogPost[]): Promise<string> {
    const prompt = `Create an engaging email newsletter featuring these blog posts:
    ${posts.map(post => `- ${post.title}: ${post.summary}`).join('\n')}
    Include: introduction, featured articles, tips section, call-to-action`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
    });

    return completion.choices[0].message.content;
  }

  private formatBlogPost(content: string, topic: string): BlogPost {
    // 实现博客文章格式化逻辑
    return {
      title: topic,
      content,
      summary: this.generateSummary(content),
      publishDate: new Date(),
      readingTime: this.calculateReadingTime(content),
    };
  }

  private parseSEOMetadata(content: string): SEOMetadata {
    // 实现SEO元数据解析逻辑
    return {
      title: '',
      description: '',
      keywords: [],
    };
  }

  private generateSummary(content: string): string {
    // 实现摘要生成逻辑
    return content.substring(0, 200) + '...';
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }
}
