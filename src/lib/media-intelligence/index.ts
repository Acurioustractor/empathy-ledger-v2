/**
 * Media Intelligence Module - Empathy Ledger Content Hub
 *
 * AI-powered media analysis with consent gates for:
 * - Photo/video tagging
 * - Face recognition
 * - Theme extraction
 *
 * CRITICAL: All analysis requires explicit consent before processing.
 */

export {
  PhotoAnalyzer,
  createPhotoAnalyzer,
  type PhotoAnalysisRequest,
  type PhotoAnalysisResult,
  type DetectedObject,
  type AnalysisConsent
} from './photo-analyzer';

export {
  FaceRecognition,
  createFaceRecognition,
  type FaceLocation,
  type DetectedFace,
  type FaceMatch,
  type ConsentRequest
} from './face-recognition';

export {
  ThemeExtractor,
  createThemeExtractor,
  type MediaTheme,
  type ThemeMatch
} from './theme-extractor';
