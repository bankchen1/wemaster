import { Metadata } from 'next';
import { MeetingRoom } from '@/components/meeting/MeetingRoom';
import { getCurrentUser } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Meeting Room | Wepal',
  description: 'Join your online tutoring session',
};

export default async function MeetingPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    return <div>Please login to join the meeting</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <MeetingRoom
        meetingId={params.id}
        token={user.token}
        userName={user.name}
        userEmail={user.email}
        isHost={user.role === 'tutor'}
      />
    </div>
  );
}
