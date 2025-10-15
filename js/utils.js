function encodeBase64(str) {
  if (typeof btoa === 'function') {
    try {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(str);
      let binary = '';
      bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });
      return btoa(binary);
    } catch (error) {
      return btoa(unescape(encodeURIComponent(str)));
    }
  }
  return Buffer.from(str, 'utf-8').toString('base64');
}

function decodeBase64(base64) {
  if (typeof atob === 'function') {
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      const decoder = new TextDecoder();
      return decoder.decode(bytes);
    } catch (error) {
      return decodeURIComponent(escape(atob(base64)));
    }
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

export function encodeAnswersBase64(answers, questions) {
  const normalized = questions.map((_, index) => {
    const userAnswer = answers[index];
    if (!userAnswer) {
      return [];
    }
    return Array.isArray(userAnswer) ? userAnswer : [userAnswer];
  });
  const payload = {
    v: 1,
    answers: normalized,
  };
  return encodeBase64(JSON.stringify(payload));
}

export function decodeAnswersBase64(base64, questions) {
  try {
    const decoded = decodeBase64(base64);
    const payload = JSON.parse(decoded);
    if (!payload || !Array.isArray(payload.answers)) {
      return [];
    }
    return payload.answers.slice(0, questions.length).map((entry, index) => {
      if (!Array.isArray(entry)) {
        return typeof entry === 'number' ? [entry] : [];
      }
      const optionLength = questions[index]?.options?.length ?? 0;
      return entry.filter(
        (optionIndex) =>
          typeof optionIndex === 'number' &&
          optionIndex >= 0 &&
          optionIndex < optionLength
      );
    });
  } catch (error) {
    console.error('回答の復号に失敗しました:', error);
    return [];
  }
}
