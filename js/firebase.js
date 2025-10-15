export async function initializeAuth() {
  if (window.firebaseAuth) {
    return window.firebaseAuth;
  }
  console.warn('Firebase Auth が初期化されていないため、ローカルモードで動作します。');
  return null;
}

export async function handleDiagnosisComplete() {
  if (!window.firebaseDb) {
    console.info('Firestore 連携はスキップされました。');
    return { isSameAsPrevious: false };
  }
  // 実装が必要な場合はここでFirestoreに保存する
  return { isSameAsPrevious: false };
}

export async function getUserStats() {
  if (!window.firebaseAuth || !window.firebaseDb) {
    return {
      hasPreviousResult: false,
      lastScore: null,
      lastLevel: null,
      lastDiagnosisDate: null,
    };
  }
  // Firestoreの実装が追加されたらここでユーザー情報を読み込む
  return {
    hasPreviousResult: false,
    lastScore: null,
    lastLevel: null,
    lastDiagnosisDate: null,
  };
}
