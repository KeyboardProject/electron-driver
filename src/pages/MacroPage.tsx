import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { ButtonSection } from '../components/macro/ButtonSection';
import { UpdateModal } from '../components/update/UpdateModal';
import { MacroListModal } from '../components/macro/MacroListModal';
const { ipcRenderer } = window.require('electron');

interface MacroPageProps {
  ipAddress: string;
  onIpAddressChange: (value: string) => void;
  onConnect: () => void;
}

const MacroPage: React.FC<MacroPageProps> = ({
  ipAddress,
  onIpAddressChange,
  onConnect
}) => {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isMacroListOpen, setIsMacroListOpen] = useState(false);

  const resetDriver = () => {
    ipcRenderer.send('restart-driver');
  };

  const handleImportProfile = () => {
    ipcRenderer.send('import-profile');
  };

  const handleExportProfile = (filename: string) => {
    ipcRenderer.send('export-profile', filename);
  };

  return (
    <div className="macro-page">
      <ButtonSection />
      <div className="macro-page__controls">
        <div className="macro-page__ip-section">
          <input
            value={ipAddress}
            onChange={(e) => onIpAddressChange(e.target.value)}
            placeholder="IP 주소 입력"
            className="macro-page__ip-input"
          />
          <Button text="적용" onClick={onConnect} />
        </div>
        
        <div className="macro-page__buttons">
          <Button text="리셋" onClick={resetDriver} variant="secondary" />
          <Button text="업데이트" onClick={() => setIsUpdateOpen(true)} />
          <Button text="가져오기" onClick={handleImportProfile} />
          <Button text="내보내기" onClick={() => setIsMacroListOpen(true)} />
        </div>
      </div>

      {isUpdateOpen && (
        <UpdateModal 
          isOpen={isUpdateOpen} 
          onClose={() => setIsUpdateOpen(false)} 
        />
      )}
      
      {isMacroListOpen && (
        <MacroListModal 
          onClose={() => setIsMacroListOpen(false)} 
          onMacroSelected={handleExportProfile}
        />
      )}
    </div>
  );
};

export default MacroPage; 