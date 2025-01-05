import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/session';
import { TutorSchedule } from '@/components/meeting/TutorSchedule';
import { StudentBooking } from '@/components/meeting/StudentBooking';

export const metadata: Metadata = {
  title: 'Dashboard | Wepal',
  description: 'Manage your tutoring sessions',
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <div>Please login to access dashboard</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {user.role === 'tutor' ? (
        <TutorSchedule userId={user.id} />
      ) : (
        <StudentBooking userId={user.id} />
      )}
    </div>
  );
}
