import React, { useState, useEffect } from 'react';
import { Button, Badge } from '@fluentui/react-components';
import { ArrowUpload20Regular } from '@fluentui/react-icons';
import { checkForUpdates } from '../lib/versionUtils';
import { openUrl } from '@tauri-apps/plugin-opener';

interface UpdateCheckerProps {
  className?: string;
}

export const UpdateChecker: React.FC<UpdateCheckerProps> = ({ className }) => {
  const [updateInfo, setUpdateInfo] = useState<{
    hasUpdate: boolean;
    latestVersion?: string;
    releaseUrl?: string;
  }>({ hasUpdate: false });
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 업데이트 확인
    checkUpdates();
    
    // 5분마다 업데이트 확인
    const interval = setInterval(checkUpdates, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkUpdates = async () => {
    setIsChecking(true);
    try {
      const info = await checkForUpdates();
      setUpdateInfo(info);
    } catch (error) {
      console.error('업데이트 확인 실패:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUpdateClick = async () => {
    if (updateInfo.releaseUrl) {
      try {
        // Tauri의 opener 플러그인을 사용하여 브라우저에서 URL 열기
        await openUrl(updateInfo.releaseUrl);
      } catch (error) {
        console.error('브라우저에서 릴리즈 페이지를 여는 중 오류 발생:', error);
      }
    }
  };

  // 업데이트가 없으면 렌더링하지 않음
  if (!updateInfo.hasUpdate) {
    return null;
  }

  return (
    <Button
      className={className}
      appearance="subtle"
      onClick={handleUpdateClick}
      disabled={isChecking}
    >
      <Badge appearance="filled">
        업데이트 가능
      </Badge>
    </Button>
  );
};
