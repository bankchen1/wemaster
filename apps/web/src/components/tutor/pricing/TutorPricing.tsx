import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Award, Check } from 'lucide-react';
import { getTutorPricing } from '@/lib/api/tutors';

interface TutorPricingProps {
  tutorId: string;
}

interface PricingPackage {
  id: string;
  name: string;
  description: string;
  duration: number;
  pricePerHour: number;
  totalPrice: number;
  features: string[];
  popularity: 'low' | 'medium' | 'high';
  discount?: {
    percentage: number;
    endDate: string;
  };
}

interface GroupClass {
  id: string;
  name: string;
  description: string;
  schedule: {
    startDate: string;
    endDate: string;
    daysOfWeek: string[];
    time: string;
  };
  maxStudents: number;
  currentStudents: number;
  pricePerStudent: number;
  totalSessions: number;
}

export function TutorPricing({ tutorId }: TutorPricingProps) {
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [groupClasses, setGroupClasses] = useState<GroupClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPricing();
  }, [tutorId]);

  async function loadPricing() {
    try {
      setLoading(true);
      const data = await getTutorPricing(tutorId);
      setPackages(data.packages);
      setGroupClasses(data.groupClasses);
    } catch (error) {
      console.error('Failed to load pricing:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Card className="p-6">Loading pricing information...</Card>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Pricing & Packages</h2>

      {/* Individual Sessions */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold">Individual Sessions</h3>
        <div className="grid gap-4">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="p-4 relative">
              {pkg.popularity === 'high' && (
                <Badge className="absolute top-2 right-2">
                  Most Popular
                </Badge>
              )}
              
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{pkg.name}</h4>
                  <p className="text-sm text-gray-600">{pkg.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    ${pkg.pricePerHour}
                    <span className="text-sm font-normal text-gray-600">/hour</span>
                  </div>
                  {pkg.discount && (
                    <div className="text-sm text-green-600">
                      {pkg.discount.percentage}% off until{' '}
                      {new Date(pkg.discount.endDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {pkg.duration} minutes
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  1-on-1
                </div>
              </div>

              <div className="space-y-2">
                {pkg.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Group Classes */}
      {groupClasses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Group Classes</h3>
          <Accordion type="single" collapsible>
            {groupClasses.map((groupClass) => (
              <AccordionItem key={groupClass.id} value={groupClass.id}>
                <AccordionTrigger>
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <span className="font-medium">{groupClass.name}</span>
                      <div className="text-sm text-gray-600">
                        {groupClass.schedule.daysOfWeek.join(', ')} at{' '}
                        {groupClass.schedule.time}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        ${groupClass.pricePerStudent}
                      </div>
                      <div className="text-sm text-gray-600">
                        {groupClass.currentStudents}/{groupClass.maxStudents} students
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <p className="text-gray-600">{groupClass.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Schedule</div>
                        <div className="text-gray-600">
                          {new Date(groupClass.schedule.startDate).toLocaleDateString()}{' '}
                          - {new Date(groupClass.schedule.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Total Sessions</div>
                        <div className="text-gray-600">
                          {groupClass.totalSessions} classes
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">
                        Certificate upon completion
                      </span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* Additional Information */}
      <div className="mt-8 text-sm text-gray-500">
        <p>• All prices are in USD</p>
        <p>• Package discounts are applied automatically</p>
        <p>• Free trial session available for new students</p>
        <p>• 100% satisfaction guarantee or money back</p>
      </div>
    </Card>
  );
}
