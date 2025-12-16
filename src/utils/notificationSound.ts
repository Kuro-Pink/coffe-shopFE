let audio: HTMLAudioElement | null = null;
let unlocked = false;

export async function unlockNotificationSoundByUserGesture() {
  if (unlocked) return;

  audio = new Audio('/notification.mp3');
  audio.volume = 1;
  audio.loop = true;
  audio.muted = false;

  await audio.play();
  audio.pause();
  audio.currentTime = 0;

  unlocked = true;
  console.log('🔓 Notification sound unlocked');
}

export function playNotificationSound() {
  if (!audio || !unlocked) return;
  audio.currentTime = 0;
  audio.loop = true;
  audio.play().catch(() => {});
}

export function stopNotificationSound() {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

export function isAudioUnlocked() {
  return unlocked;
}
