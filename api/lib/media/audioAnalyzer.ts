import ffmpeg from 'fluent-ffmpeg';

export const getAudioBitrate = (filePath: string): Promise<number> => {
  return new Promise((resolve, reject) => {

    ffmpeg.ffprobe(filePath, (err: any, metadata: any) => {
      if (err) 
        return reject(err);

      const audioStream = metadata.streams?.find((s: any) => s.codec_type === 'audio');
      const audioBitrate = audioStream?.bit_rate ? Math.round(audioStream.bit_rate / 1000) : 64

      resolve(audioBitrate);
    });

  });
}
