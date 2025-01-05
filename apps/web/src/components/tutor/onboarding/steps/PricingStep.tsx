import { useFormContext } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function PricingStep() {
  const { register, watch, setValue } = useFormContext();
  const pricing = watch('pricing');

  // 计算实际价格和平台分成
  const calculatePrices = (teacherPrice: number) => {
    const platformFee = teacherPrice * 0.25; // 25% 平台基础分成
    const studentPrice = teacherPrice + platformFee;
    return {
      platformFee,
      studentPrice,
    };
  };

  const basicPrice = watch('pricing.basicLesson.price') || 0;
  const { platformFee, studentPrice } = calculatePrices(basicPrice);

  return (
    <div className="space-y-6">
      {/* 试课设置 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">试课设置</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>是否提供试课</Label>
            <Switch
              checked={pricing.trialLesson.enabled}
              onCheckedChange={(checked) =>
                setValue('pricing.trialLesson.enabled', checked)
              }
            />
          </div>

          {pricing.trialLesson.enabled && (
            <>
              <div className="space-y-2">
                <Label>试课时长</Label>
                <RadioGroup
                  defaultValue={pricing.trialLesson.duration.toString()}
                  onValueChange={(value) =>
                    setValue('pricing.trialLesson.duration', parseInt(value))
                  }
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="15" />
                    <Label>15分钟</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="30" />
                    <Label>30分钟</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>试课价格</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('pricing.trialLesson.price')}
                  />
                  <span className="text-muted-foreground">元</span>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* 基础课程定价 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">基础课程定价</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>课时费（您的收入）</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('pricing.basicLesson.price')}
                />
                <span className="text-muted-foreground">元</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>课时长度</Label>
              <Select
                value={pricing.basicLesson.duration.toString()}
                onValueChange={(value) =>
                  setValue('pricing.basicLesson.duration', parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30分钟</SelectItem>
                  <SelectItem value="45">45分钟</SelectItem>
                  <SelectItem value="60">60分钟</SelectItem>
                  <SelectItem value="90">90分钟</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>课时数</TableHead>
                <TableHead>您的收入</TableHead>
                <TableHead>平台费用</TableHead>
                <TableHead>学生支付</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>1-10</TableCell>
                <TableCell>{basicPrice}元</TableCell>
                <TableCell>{platformFee.toFixed(2)}元 (25%)</TableCell>
                <TableCell>{studentPrice.toFixed(2)}元</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>11+</TableCell>
                <TableCell>{basicPrice}元</TableCell>
                <TableCell>{(basicPrice * 0.15).toFixed(2)}元 (15%)</TableCell>
                <TableCell>
                  {(basicPrice + basicPrice * 0.15).toFixed(2)}元
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <p className="text-sm text-muted-foreground">
            注：随着您完成的课时增加，平台分成比例会逐步降低。教学11节课以上时，平台仅收取15%的服务费。
          </p>
        </div>
      </Card>

      {/* 套餐折扣 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">套餐折扣（可选）</h3>
        <div className="space-y-4">
          {[5, 10, 20, 40].map((lessons) => (
            <div key={lessons} className="flex items-center space-x-4">
              <Switch
                checked={pricing.packages[lessons].enabled}
                onCheckedChange={(checked) =>
                  setValue(`pricing.packages.${lessons}.enabled`, checked)
                }
              />
              <span className="w-32">{lessons}节课套餐：</span>
              <Input
                type="number"
                min="0"
                max="100"
                disabled={!pricing.packages[lessons].enabled}
                {...register(`pricing.packages.${lessons}.discount`)}
                className="w-24"
              />
              <span className="text-muted-foreground">% 折扣</span>
            </div>
          ))}
          <p className="text-sm text-muted-foreground">
            设置套餐折扣可以提高课程购买率。建议合理设置折扣比例，既能吸引学生又能保证收益。
          </p>
        </div>
      </Card>
    </div>
  );
}
