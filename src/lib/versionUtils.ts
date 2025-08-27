// package.json에서 버전 정보를 가져오기 위해 import
import packageJson from '../../package.json';

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  prerelease: boolean;
  draft: boolean;
}

/**
 * 현재 앱의 버전을 가져옵니다.
 * package.json의 version 필드와 자동으로 동기화됩니다.
 */
export const getCurrentVersion = (): string => {
  return packageJson.version;
};

/**
 * 버전 문자열을 비교 가능한 배열로 변환합니다.
 * 예: "1.2.3" -> [1, 2, 3]
 */
const parseVersion = (version: string): number[] => {
  return version.replace(/^v/, '').split('.').map(Number);
};

/**
 * 두 버전을 비교합니다.
 * @param version1 첫 번째 버전
 * @param version2 두 번째 버전
 * @returns version1이 더 낮으면 -1, 같으면 0, 더 높으면 1
 */
export const compareVersions = (version1: string, version2: string): number => {
  const v1 = parseVersion(version1);
  const v2 = parseVersion(version2);
  
  const maxLength = Math.max(v1.length, v2.length);
  
  for (let i = 0; i < maxLength; i++) {
    const num1 = v1[i] || 0;
    const num2 = v2[i] || 0;
    
    if (num1 < num2) return -1;
    if (num1 > num2) return 1;
  }
  
  return 0;
};

/**
 * GitHub API를 통해 최신 릴리즈 정보를 가져옵니다.
 */
export const fetchLatestRelease = async (): Promise<GitHubRelease | null> => {
  try {
    const response = await fetch('https://api.github.com/repos/jihun-io/dailywork/releases/latest');
    
    if (!response.ok) {
      throw new Error(`GitHub API 요청 실패: ${response.status}`);
    }
    
    const release: GitHubRelease = await response.json();
    
    // 드래프트나 프리릴리즈는 제외
    if (release.draft || release.prerelease) {
      return null;
    }
    
    return release;
  } catch (error) {
    console.error('최신 릴리즈 정보를 가져오는 중 오류 발생:', error);
    return null;
  }
};

/**
 * 업데이트가 사용 가능한지 확인합니다.
 */
export const checkForUpdates = async (): Promise<{
  hasUpdate: boolean;
  latestVersion?: string;
  releaseUrl?: string;
}> => {
  const currentVersion = getCurrentVersion();
  const latestRelease = await fetchLatestRelease();
  
  if (!latestRelease) {
    return { hasUpdate: false };
  }
  
  const hasUpdate = compareVersions(currentVersion, latestRelease.tag_name) < 0;
  
  return {
    hasUpdate,
    latestVersion: latestRelease.tag_name,
    releaseUrl: latestRelease.html_url,
  };
};
