#!/usr/bin/env python3
"""
Praat-based Voice Analysis Service

Analyzes audio recordings for prosodic features (pitch, intensity, rhythm)
and emotional characteristics using Praat via Parselmouth.

Dependencies:
    pip install praat-parselmouth numpy scipy

Usage:
    python praat_analyzer.py analyze <audio_file_path>
    python praat_analyzer.py batch <input_dir> <output_dir>
"""

import sys
import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
import numpy as np

try:
    import parselmouth
    from parselmouth.praat import call
except ImportError:
    print("Error: praat-parselmouth not installed. Run: pip install praat-parselmouth")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class PitchAnalysis:
    """Pitch (F0) analysis results"""
    mean_f0: float
    median_f0: float
    std_f0: float
    min_f0: float
    max_f0: float
    range_f0: float
    range_semitones: float
    voiced_fraction: float  # Proportion of speech that is voiced


@dataclass
class IntensityAnalysis:
    """Intensity (loudness) analysis results"""
    mean_intensity: float
    median_intensity: float
    std_intensity: float
    min_intensity: float
    max_intensity: float
    dynamic_range: float


@dataclass
class RhythmAnalysis:
    """Rhythm and timing analysis results"""
    speech_rate: float  # syllables per second (estimated)
    articulation_rate: float  # syllables per second excluding pauses
    pause_count: int
    mean_pause_duration: float
    total_pause_time: float
    speaking_time: float
    total_duration: float


@dataclass
class VoiceQuality:
    """Voice quality metrics"""
    jitter_local: float  # Pitch perturbation
    shimmer_local: float  # Amplitude perturbation
    hnr_mean: float  # Harmonics-to-noise ratio
    crest_factor: float  # Peak-to-RMS ratio


@dataclass
class EmotionalProsody:
    """Prosodic features associated with emotion"""
    arousal_estimate: float  # 0-1 scale based on pitch variation and intensity
    valence_estimate: float  # -1 to 1 scale (positive/negative)
    pitch_variability: str  # "low", "medium", "high"
    intensity_variability: str  # "low", "medium", "high"
    speaking_pace: str  # "slow", "moderate", "fast"
    voice_quality_rating: str  # "clear", "rough", "breathy"


@dataclass
class VoiceAnalysisResult:
    """Complete voice analysis results"""
    file_path: str
    duration: float
    pitch: PitchAnalysis
    intensity: IntensityAnalysis
    rhythm: RhythmAnalysis
    voice_quality: VoiceQuality
    emotional_prosody: EmotionalProsody
    success: bool
    error: Optional[str] = None


class PraatAnalyzer:
    """
    Analyzes audio files using Praat for prosodic and emotional features
    """

    def __init__(
        self,
        pitch_floor: float = 75.0,  # Hz, lower for male voices
        pitch_ceiling: float = 500.0,  # Hz, higher for female/child voices
        time_step: float = 0.0,  # Auto
        intensity_min_pitch: float = 100.0  # Hz
    ):
        self.pitch_floor = pitch_floor
        self.pitch_ceiling = pitch_ceiling
        self.time_step = time_step
        self.intensity_min_pitch = intensity_min_pitch

    def analyze_audio(self, audio_path: str) -> VoiceAnalysisResult:
        """
        Analyze an audio file for prosodic and emotional features

        Args:
            audio_path: Path to audio file (WAV, MP3, etc.)

        Returns:
            VoiceAnalysisResult with all analysis data
        """
        try:
            logger.info(f"Analyzing audio file: {audio_path}")

            # Load audio
            sound = parselmouth.Sound(audio_path)
            duration = sound.get_total_duration()

            logger.info(f"Audio duration: {duration:.2f} seconds")

            # Run all analyses
            pitch_result = self._analyze_pitch(sound)
            intensity_result = self._analyze_intensity(sound)
            rhythm_result = self._analyze_rhythm(sound)
            quality_result = self._analyze_voice_quality(sound)
            emotion_result = self._estimate_emotional_prosody(
                pitch_result,
                intensity_result,
                rhythm_result,
                quality_result
            )

            return VoiceAnalysisResult(
                file_path=audio_path,
                duration=duration,
                pitch=pitch_result,
                intensity=intensity_result,
                rhythm=rhythm_result,
                voice_quality=quality_result,
                emotional_prosody=emotion_result,
                success=True
            )

        except Exception as e:
            logger.error(f"Error analyzing audio: {str(e)}", exc_info=True)
            return VoiceAnalysisResult(
                file_path=audio_path,
                duration=0,
                pitch=None,
                intensity=None,
                rhythm=None,
                voice_quality=None,
                emotional_prosody=None,
                success=False,
                error=str(e)
            )

    def _analyze_pitch(self, sound: parselmouth.Sound) -> PitchAnalysis:
        """Extract pitch (F0) features"""
        pitch = call(sound, "To Pitch", self.time_step, self.pitch_floor, self.pitch_ceiling)

        # Get pitch values
        pitch_values = pitch.selected_array['frequency']
        pitch_values = pitch_values[pitch_values != 0]  # Remove unvoiced frames

        if len(pitch_values) == 0:
            logger.warning("No voiced frames detected")
            return PitchAnalysis(0, 0, 0, 0, 0, 0, 0, 0)

        mean_f0 = np.mean(pitch_values)
        median_f0 = np.median(pitch_values)
        std_f0 = np.std(pitch_values)
        min_f0 = np.min(pitch_values)
        max_f0 = np.max(pitch_values)
        range_f0 = max_f0 - min_f0

        # Convert range to semitones (musical scale)
        range_semitones = 12 * np.log2(max_f0 / min_f0) if min_f0 > 0 else 0

        # Voiced fraction
        total_frames = len(pitch.selected_array['frequency'])
        voiced_frames = len(pitch_values)
        voiced_fraction = voiced_frames / total_frames if total_frames > 0 else 0

        return PitchAnalysis(
            mean_f0=float(mean_f0),
            median_f0=float(median_f0),
            std_f0=float(std_f0),
            min_f0=float(min_f0),
            max_f0=float(max_f0),
            range_f0=float(range_f0),
            range_semitones=float(range_semitones),
            voiced_fraction=float(voiced_fraction)
        )

    def _analyze_intensity(self, sound: parselmouth.Sound) -> IntensityAnalysis:
        """Extract intensity (loudness) features"""
        intensity = call(sound, "To Intensity", self.intensity_min_pitch, 0.0, "yes")

        intensity_values = call(intensity, "List values", "all", "Hertz", "yes")
        intensity_values = np.array(intensity_values)
        intensity_values = intensity_values[~np.isnan(intensity_values)]

        if len(intensity_values) == 0:
            logger.warning("No intensity values detected")
            return IntensityAnalysis(0, 0, 0, 0, 0, 0)

        mean_intensity = np.mean(intensity_values)
        median_intensity = np.median(intensity_values)
        std_intensity = np.std(intensity_values)
        min_intensity = np.min(intensity_values)
        max_intensity = np.max(intensity_values)
        dynamic_range = max_intensity - min_intensity

        return IntensityAnalysis(
            mean_intensity=float(mean_intensity),
            median_intensity=float(median_intensity),
            std_intensity=float(std_intensity),
            min_intensity=float(min_intensity),
            max_intensity=float(max_intensity),
            dynamic_range=float(dynamic_range)
        )

    def _analyze_rhythm(self, sound: parselmouth.Sound) -> RhythmAnalysis:
        """Analyze rhythm and timing"""
        duration = sound.get_total_duration()

        # Detect pauses using intensity
        intensity = call(sound, "To Intensity", self.intensity_min_pitch, 0.0, "yes")

        # Get intensity values
        intensity_values = call(intensity, "List values", "all", "Hertz", "yes")
        intensity_values = np.array(intensity_values)

        # Simple pause detection: intensity below threshold
        threshold = np.mean(intensity_values[~np.isnan(intensity_values)]) - 10  # dB below mean
        is_pause = intensity_values < threshold

        # Count pauses (consecutive pause frames)
        pause_count = 0
        in_pause = False
        pause_durations = []
        pause_start = 0
        frame_duration = duration / len(is_pause)

        for i, is_p in enumerate(is_pause):
            if is_p and not in_pause:
                in_pause = True
                pause_start = i
                pause_count += 1
            elif not is_p and in_pause:
                in_pause = False
                pause_durations.append((i - pause_start) * frame_duration)

        total_pause_time = sum(pause_durations) if pause_durations else 0
        mean_pause_duration = np.mean(pause_durations) if pause_durations else 0
        speaking_time = duration - total_pause_time

        # Estimate speech rate (syllables per second)
        # Very rough estimate: ~4-7 syllables per second typical
        # We'll use intensity peaks as proxy for syllables
        intensity_smooth = intensity_values[~np.isnan(intensity_values)]
        if len(intensity_smooth) > 0:
            from scipy import signal
            peaks, _ = signal.find_peaks(intensity_smooth, distance=5)
            syllable_estimate = len(peaks)
            speech_rate = syllable_estimate / duration if duration > 0 else 0
            articulation_rate = syllable_estimate / speaking_time if speaking_time > 0 else 0
        else:
            speech_rate = 0
            articulation_rate = 0

        return RhythmAnalysis(
            speech_rate=float(speech_rate),
            articulation_rate=float(articulation_rate),
            pause_count=int(pause_count),
            mean_pause_duration=float(mean_pause_duration),
            total_pause_time=float(total_pause_time),
            speaking_time=float(speaking_time),
            total_duration=float(duration)
        )

    def _analyze_voice_quality(self, sound: parselmouth.Sound) -> VoiceQuality:
        """Analyze voice quality metrics"""
        # Pitch for jitter/shimmer
        pitch = call(sound, "To Pitch", self.time_step, self.pitch_floor, self.pitch_ceiling)
        point_process = call(sound, "To PointProcess (periodic, cc)", self.pitch_floor, self.pitch_ceiling)

        # Jitter (pitch perturbation)
        jitter_local = call(point_process, "Get jitter (local)", 0, 0, 0.0001, 0.02, 1.3)

        # Shimmer (amplitude perturbation)
        shimmer_local = call([sound, point_process], "Get shimmer (local)", 0, 0, 0.0001, 0.02, 1.3, 1.6)

        # Harmonics-to-Noise Ratio
        harmonicity = call(sound, "To Harmonicity (cc)", 0.01, self.pitch_floor, 0.1, 1.0)
        hnr_mean = call(harmonicity, "Get mean", 0, 0)

        # Crest factor (peak to RMS ratio)
        rms = np.sqrt(np.mean(sound.values**2))
        peak = np.max(np.abs(sound.values))
        crest_factor = peak / rms if rms > 0 else 0

        return VoiceQuality(
            jitter_local=float(jitter_local if not np.isnan(jitter_local) else 0),
            shimmer_local=float(shimmer_local if not np.isnan(shimmer_local) else 0),
            hnr_mean=float(hnr_mean if not np.isnan(hnr_mean) else 0),
            crest_factor=float(crest_factor)
        )

    def _estimate_emotional_prosody(
        self,
        pitch: PitchAnalysis,
        intensity: IntensityAnalysis,
        rhythm: RhythmAnalysis,
        quality: VoiceQuality
    ) -> EmotionalProsody:
        """
        Estimate emotional state from prosodic features

        Based on research:
        - High arousal: high pitch variation, high intensity, fast speech
        - Positive valence: rising pitch contours, moderate variation
        - Negative valence: falling pitch contours, low variation
        """

        # Arousal estimate (0-1)
        # Higher pitch range, intensity variation, and speech rate -> higher arousal
        pitch_arousal = min(1.0, pitch.range_semitones / 20)  # Normalize to ~20 semitones
        intensity_arousal = min(1.0, intensity.dynamic_range / 30)  # Normalize to ~30 dB
        rhythm_arousal = min(1.0, rhythm.speech_rate / 7)  # Normalize to ~7 syllables/sec

        arousal_estimate = (pitch_arousal + intensity_arousal + rhythm_arousal) / 3

        # Valence estimate (-1 to 1)
        # This is harder without pitch contour analysis, but we can use proxies:
        # - Higher mean pitch often indicates positive emotion
        # - Good voice quality (high HNR, low jitter) indicates positive
        # - Moderate variability indicates positive (too low or too high can be negative)

        # Normalize pitch to typical range (100-250 Hz)
        pitch_valence = (pitch.mean_f0 - 100) / 150 - 1  # -1 to 1
        pitch_valence = max(-1, min(1, pitch_valence))

        # Voice quality contribution
        quality_valence = min(1.0, quality.hnr_mean / 20) * 2 - 1  # -1 to 1

        # Pitch variability (moderate is good)
        cv_pitch = pitch.std_f0 / pitch.mean_f0 if pitch.mean_f0 > 0 else 0
        if 0.1 < cv_pitch < 0.3:
            variability_valence = 1.0
        elif cv_pitch < 0.1:
            variability_valence = 0.0  # Monotone, possibly negative
        else:
            variability_valence = 0.5  # High variation, possibly negative (anxiety)

        valence_estimate = (pitch_valence + quality_valence + variability_valence) / 3

        # Categorical assessments
        if pitch.std_f0 / pitch.mean_f0 < 0.1:
            pitch_variability = "low"
        elif pitch.std_f0 / pitch.mean_f0 < 0.25:
            pitch_variability = "medium"
        else:
            pitch_variability = "high"

        if intensity.std_intensity < 5:
            intensity_variability = "low"
        elif intensity.std_intensity < 10:
            intensity_variability = "medium"
        else:
            intensity_variability = "high"

        if rhythm.speech_rate < 3:
            speaking_pace = "slow"
        elif rhythm.speech_rate < 5:
            speaking_pace = "moderate"
        else:
            speaking_pace = "fast"

        if quality.hnr_mean > 15:
            voice_quality_rating = "clear"
        elif quality.hnr_mean > 10:
            voice_quality_rating = "moderate"
        elif quality.jitter_local > 0.02:
            voice_quality_rating = "rough"
        else:
            voice_quality_rating = "breathy"

        return EmotionalProsody(
            arousal_estimate=float(arousal_estimate),
            valence_estimate=float(valence_estimate),
            pitch_variability=pitch_variability,
            intensity_variability=intensity_variability,
            speaking_pace=speaking_pace,
            voice_quality_rating=voice_quality_rating
        )


def result_to_dict(result: VoiceAnalysisResult) -> Dict[str, Any]:
    """Convert analysis result to dictionary for JSON serialization"""
    if not result.success:
        return {
            'success': False,
            'file_path': result.file_path,
            'error': result.error
        }

    return {
        'success': True,
        'file_path': result.file_path,
        'duration': result.duration,
        'pitch': asdict(result.pitch),
        'intensity': asdict(result.intensity),
        'rhythm': asdict(result.rhythm),
        'voice_quality': asdict(result.voice_quality),
        'emotional_prosody': asdict(result.emotional_prosody)
    }


def main():
    """Command-line interface"""
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    command = sys.argv[1]

    if command == 'analyze':
        if len(sys.argv) < 3:
            print("Usage: python praat_analyzer.py analyze <audio_file_path>")
            sys.exit(1)

        audio_path = sys.argv[2]
        analyzer = PraatAnalyzer()
        result = analyzer.analyze_audio(audio_path)

        # Output JSON
        print(json.dumps(result_to_dict(result), indent=2))

    elif command == 'batch':
        if len(sys.argv) < 4:
            print("Usage: python praat_analyzer.py batch <input_dir> <output_dir>")
            sys.exit(1)

        input_dir = Path(sys.argv[2])
        output_dir = Path(sys.argv[3])
        output_dir.mkdir(parents=True, exist_ok=True)

        analyzer = PraatAnalyzer()

        # Process all audio files
        for audio_file in input_dir.glob('*.wav'):
            logger.info(f"Processing: {audio_file}")
            result = analyzer.analyze_audio(str(audio_file))

            # Save result
            output_file = output_dir / f"{audio_file.stem}_analysis.json"
            with open(output_file, 'w') as f:
                json.dump(result_to_dict(result), f, indent=2)

            logger.info(f"Saved analysis to: {output_file}")

    else:
        print(f"Unknown command: {command}")
        print(__doc__)
        sys.exit(1)


if __name__ == '__main__':
    main()
