
'use client';

import {
  collection,
  serverTimestamp,
  Firestore,
  doc,
  arrayUnion,
} from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';

type CommunityForumData = {
  name: string;
  description: string;
  interest: string;
  imageId: string;
};

export function createCommunityForum(
  firestore: Firestore,
  userId: string,
  forumData: CommunityForumData
) {
  if (!userId) {
    throw new Error('User ID is required to create a forum.');
  }

  const forumsCollectionRef = collection(firestore, 'communityForums');

  const data = {
    ...forumData,
    memberIds: [userId], // Creator is the first member
    createdAt: serverTimestamp(),
  };

  return addDocumentNonBlocking(forumsCollectionRef, data);
}

export function joinCommunityForum(
  firestore: Firestore,
  forumId: string,
  userId: string
) {
  if (!forumId || !userId) {
    throw new Error('Forum ID and User ID are required to join a group.');
  }

  const forumRef = doc(firestore, 'communityForums', forumId);

  // This uses a non-blocking update. The UI can optimistically update.
  return updateDocumentNonBlocking(forumRef, {
    memberIds: arrayUnion(userId),
  });
}

export function createPostInForum(
    firestore: Firestore,
    forumId: string,
    userId: string,
    authorName: string,
    content: string,
) {
    if (!forumId || !userId || !authorName) {
        throw new Error('Forum ID, User ID, and Author Name are required to create a post.');
    }

    const postsCollectionRef = collection(firestore, 'communityForums', forumId, 'posts');

    const postData = {
        forumId,
        authorId: userId,
        authorName,
        content,
        createdAt: serverTimestamp(),
    };

    return addDocumentNonBlocking(postsCollectionRef, postData);
}

    