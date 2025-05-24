declare module 'zxcvbn' {
  interface ZXCVBNFeedback {
    suggestions: string[];
    warning: string;
  }

  interface ZXCVBNResult {
    score: 0 | 1 | 2 | 3 | 4;
    feedback: ZXCVBNFeedback;
  }

  export default function zxcvbn(password: string): ZXCVBNResult;
}
