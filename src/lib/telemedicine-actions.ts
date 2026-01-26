
'use client';

import { collection, serverTimestamp, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase';

type AppointmentData = {
  doctorId: string;
  doctorName: string;
  specialty: string;
};

export function createAppointment(
  firestore: Firestore,
  userId: string,
  appointmentData: AppointmentData
) {
  if (!userId) {
    throw new Error('User ID is required to book an appointment.');
  }

  const appointmentsCollectionRef = collection(
    firestore,
    'users',
    userId,
    'telemedicineAppointments'
  );

  const data = {
    userId,
    doctorId: appointmentData.doctorId,
    doctorName: appointmentData.doctorName,
    specialty: appointmentData.specialty,
    appointmentTime: serverTimestamp(), // In a real app, this would be a user-selected value
    status: 'booked',
    createdAt: serverTimestamp(),
  };

  return addDocumentNonBlocking(appointmentsCollectionRef, data);
}
