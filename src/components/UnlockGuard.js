import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/authContext';

const db = getFirestore();

const UnlockGuard = ({ artistKey, children }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUnlock = async () => {
      if (!currentUser) {
        navigate('/home');
        return;
      }

      const docRef = doc(db, 'users', currentUser.uid, 'unlocks', artistKey);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().unlocked) {
        setLoading(false);
      } else {
        navigate('/home');
      }
    };

    checkUnlock();
  }, [currentUser, artistKey, navigate]);

  if (loading) return null;

  return <>{children}</>;
};

export default UnlockGuard;
