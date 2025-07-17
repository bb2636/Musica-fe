import { useEffect, useState, useRef } from 'react';

interface Note {
    name: string;
    frequency: number;
}
// 브라우저 호환성을 위한 타입 확장
declare global {
    interface Window {
        webkitAudioContext?: new() => AudioContext;
    }
}

const NOTES: Note[] = [
    { name: 'C', frequency: 261.63 },
    { name: 'C#', frequency: 277.18 },
    { name: 'D', frequency: 293.66 },
    { name: 'D#', frequency: 311.13 },
    { name: 'E', frequency: 329.63 },
    { name: 'F', frequency: 349.23 },
    { name: 'F#', frequency: 369.99 },
    { name: 'G', frequency: 392.00 },
    { name: 'G#', frequency: 415.30 },
    { name: 'A', frequency: 440.00 },
    { name: 'A#', frequency: 466.16 },
    { name: 'B', frequency: 493.88 }
];

export default function AITunerPage() {
    const [isListening, setIsListening] = useState(false);
    const [currentFrequency, setCurrentFrequency] = useState<number | null>(null);
    const [currentNote, setCurrentNote] = useState<string>('');
    const [tuningStatus, setTuningStatus] = useState<'low' | 'high' | 'perfect' | 'none'>('none');
    const [error, setError] = useState<string | null>(null);
    const [debug, setDebug] = useState<string>('');

    const audioContext = useRef<AudioContext | null>(null);
    const analyser = useRef<AnalyserNode | null>(null);
    const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
    const dataArray = useRef<Float32Array | null>(null);
    const animationFrame = useRef<number | null>(null);
    const stream = useRef<MediaStream | null>(null);

    // 주파수에서 가장 가까운 음정 찾기
    const findClosestNote = (frequency: number): { note: string; diff: number } => {
        let closest = NOTES[0];
        let minDiff = Math.abs(frequency - closest.frequency);

        for (const note of NOTES) {
            const diff = Math.abs(frequency - note.frequency);
            if (diff < minDiff) {
                minDiff = diff;
                closest = note;
            }
        }

        return {
            note: closest.name,
            diff: frequency - closest.frequency
        };
    };

    // 주파수 분석
    const analyzeFrequency = () => {
        if (!analyser.current || !dataArray.current) {
            setDebug('분석기 또는 데이터 배열이 없음');
            return;
        }

        analyser.current.getFloatTimeDomainData(dataArray.current);

        // 자동 상관 함수를 사용한 기본 주파수 검출
        const sampleRate = audioContext.current!.sampleRate;
        const bufferLength = dataArray.current.length;
        let maxCorrelation = 0;
        let bestOffset = -1;

        // 최소/최대 주파수 범위 (약 80Hz ~ 2000Hz)
        const minPeriod = Math.floor(sampleRate / 2000);
        const maxPeriod = Math.floor(sampleRate / 80);

        for (let offset = minPeriod; offset < maxPeriod && offset < bufferLength / 2; offset++) {
            let correlation = 0;
            for (let i = 0; i < bufferLength - offset; i++) {
                correlation += dataArray.current[i] * dataArray.current[i + offset];
            }
            if (correlation > maxCorrelation) {
                maxCorrelation = correlation;
                bestOffset = offset;
            }
        }

        setDebug(`상관관계: ${maxCorrelation.toFixed(4)}, 오프셋: ${bestOffset}`);

        if (bestOffset !== -1 && maxCorrelation > 0.005) {
            const frequency = sampleRate / bestOffset;
            setCurrentFrequency(frequency);

            const { note, diff } = findClosestNote(frequency);
            setCurrentNote(note);

            // 튜닝 상태 결정 (±5Hz 이내면 완벽)
            if (Math.abs(diff) < 5) {
                setTuningStatus('perfect');
            } else if (diff > 0) {
                setTuningStatus('high');
            } else {
                setTuningStatus('low');
            }
        } else {
            setCurrentFrequency(null);
            setCurrentNote('');
            setTuningStatus('none');
        }

        animationFrame.current = requestAnimationFrame(analyzeFrequency);
    };

    // 마이크 시작
    const startListening = async () => {
        try {
            setError(null);
            setDebug('마이크 접근 시도 중...');

            // 브라우저 호환성 체크
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('이 브라우저는 마이크 접근을 지원하지 않습니다.');
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: 44100
                }
            });

            stream.current = mediaStream;
            setDebug('마이크 스트림 획득 성공');

            // AudioContext 생성 (사용자 상호작용 후)
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioContext.current = new AudioContextClass();

            // Safari 등에서 필요한 resume
            if (audioContext.current.state === 'suspended') {
                await audioContext.current.resume();
            }

            analyser.current = audioContext.current.createAnalyser();
            microphone.current = audioContext.current.createMediaStreamSource(mediaStream);

            analyser.current.fftSize = 4096;
            analyser.current.smoothingTimeConstant = 0.3;

            const bufferLength = analyser.current.fftSize;
            dataArray.current = new Float32Array(bufferLength);

            microphone.current.connect(analyser.current);

            setDebug(`오디오 컨텍스트 초기화 완료 - 샘플레이트: ${audioContext.current.sampleRate}Hz`);
            setIsListening(true);
            analyzeFrequency();

        } catch (err) {
            const error = err as Error;
            console.error('마이크 접근 실패:', err);
            setDebug(`오류: ${error.message}`);

            if (error.name === 'NotAllowedError') {
                setError('마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
            } else if (error.name === 'NotFoundError') {
                setError('마이크가 연결되지 않았습니다. 마이크를 연결하고 다시 시도해주세요.');
            } else if (error.name === 'NotSupportedError') {
                setError('HTTPS 연결이 필요합니다. localhost 대신 127.0.0.1을 사용해보세요.');
            } else {
                setError(`마이크 접근 실패: ${error.message}`);
            }
        }
    };

    // 마이크 정지
    const stopListening = () => {
        setIsListening(false);
        setCurrentFrequency(null);
        setCurrentNote('');
        setTuningStatus('none');
        setDebug('정지됨');

        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
        }

        if (microphone.current) {
            microphone.current.disconnect();
        }

        if (stream.current) {
            stream.current.getTracks().forEach(track => track.stop());
        }

        if (audioContext.current && audioContext.current.state !== 'closed') {
            audioContext.current.close();
        }
    };

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            stopListening();
        };
    }, []);

    // 튜닝 상태에 따른 색상
    const getStatusColor = () => {
        switch (tuningStatus) {
            case 'perfect': return 'text-green-500';
            case 'high': return 'text-red-500';
            case 'low': return 'text-blue-500';
            default: return 'text-gray-400';
        }
    };

    // 튜닝 가이드 메시지
    const getStatusMessage = () => {
        switch (tuningStatus) {
            case 'perfect': return '완벽한 튜닝입니다! 🎵';
            case 'high': return '음정이 높습니다 ↓';
            case 'low': return '음정이 낮습니다 ↑';
            default: return '악기를 연주해보세요';
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">🎵 AI 튜너</h2>
                <p className="text-gray-600">악기의 음정을 정확하게 맞춰보세요</p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    ⚠️ {error}
                </div>
            )}

            {/* 디버그 정보 */}
            {debug && (
                <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded text-sm">
                    🔧 디버그: {debug}
                </div>
            )}

            {/* 튜너 디스플레이 */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                    <div className={`text-6xl font-bold mb-2 ${getStatusColor()}`}>
                        {currentNote || '♪'}
                    </div>
                    <div className="text-lg text-gray-600">
                        {currentFrequency ? `${currentFrequency.toFixed(1)} Hz` : '0.0 Hz'}
                    </div>
                </div>

                {/* 튜닝 상태 표시기 */}
                <div className="mb-6">
                    <div className="flex justify-center items-center space-x-4 mb-2">
                        <div className={`w-4 h-4 rounded-full ${tuningStatus === 'low' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <div className={`w-6 h-6 rounded-full ${tuningStatus === 'perfect' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className={`w-4 h-4 rounded-full ${tuningStatus === 'high' ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <div className={`text-lg font-medium ${getStatusColor()}`}>
                        {getStatusMessage()}
                    </div>
                </div>

                {/* 컨트롤 버튼 */}
                <div className="space-y-4">
                    <button
                        onClick={isListening ? stopListening : startListening}
                        className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                            isListening
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    >
                        {isListening ? '🛑 정지' : '🎤 시작'}
                    </button>

                    {isListening && (
                        <div className="text-sm text-gray-500">
                            마이크가 활성화되었습니다. 악기를 연주해보세요.
                        </div>
                    )}
                </div>
            </div>

            {/* 음계 참조표 */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-center">음계 참조표</h3>
                <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                    {NOTES.map((note) => (
                        <div
                            key={note.name}
                            className={`text-center p-2 rounded border ${
                                currentNote === note.name
                                    ? 'bg-blue-500 text-white border-blue-600'
                                    : 'bg-white border-gray-300'
                            }`}
                        >
                            <div className="font-medium">{note.name}</div>
                            <div className="text-xs text-gray-500">
                                {note.frequency.toFixed(0)}Hz
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 사용법 안내 */}
            <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">💡 문제해결</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Chrome에서 안 되면 127.0.0.1:5173 으로 접속해보세요</li>
                    <li>• 마이크 권한을 다시 허용하고 새로고침하세요</li>
                    <li>• HTTPS가 필요할 수 있습니다 (프로덕션 환경)</li>
                    <li>• 다른 브라우저(Firefox, Safari)에서 시도해보세요</li>
                    <li>• 디버그 메시지를 확인하여 문제를 파악하세요</li>
                    <li>• 제어판 &gt; 하드웨어 및 소리 &gt; 소리 &gt; 녹음 &gt; 마이크가 연결되었는지 확인해주세요</li>
                </ul>
            </div>
        </div>
    );
}