"use client";

import { useRouter } from 'next/navigation';
import { UserProfile } from '@/components/user-profile';

export default function ProfilePage() {
	const router = useRouter();

	const handleNavigate = (view: 'home' | 'calendar' | 'dashboard' | 'profile') => {
		switch(view) {
			case 'home':
				router.push('/');
				break;
			case 'calendar':
				router.push('/calendar');
				break;
			case 'dashboard':
				router.push('/dashboard');
				break;
			case 'profile':
			default:
				break;
		}
	};

	return <UserProfile onNavigate={handleNavigate} />;
}
