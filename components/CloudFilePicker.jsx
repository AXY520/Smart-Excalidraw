'use client';

import { useEffect, useState } from 'react';

/**
 * 云盘文件选择器组件
 * 用于从懒猫云盘选择和保存文件
 */
export default function CloudFilePicker({ 
  isOpen, 
  onClose, 
  onFileSelect,
  mode = 'open', // 'open' | 'save'
  accept = '.excalidraw,.json',
  title,
  saveFileName = 'drawing.excalidraw'
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // 动态导入懒猫文件选择器
    if (typeof window !== 'undefined') {
      import('@lazycatcloud/lzc-file-pickers');
    }
  }, []);

  useEffect(() => {
    if (!mounted || !isOpen) return;

    // 监听文件选择事件
    const handleFileSelect = (event) => {
      const files = event.detail;
      if (files && files.length > 0) {
        onFileSelect?.(files);
        onClose();
      }
    };

    // 监听关闭事件
    const handleClose = () => {
      onClose();
    };

    const picker = document.querySelector('lzc-file-picker');
    if (picker) {
      picker.addEventListener('submit', handleFileSelect);
      picker.addEventListener('close', handleClose);
    }

    return () => {
      if (picker) {
        picker.removeEventListener('submit', handleFileSelect);
        picker.removeEventListener('close', handleClose);
      }
    };
  }, [mounted, isOpen, onFileSelect, onClose]);

  if (!mounted || !isOpen) return null;

  // 根据模式设置不同的属性
  const pickerType = mode === 'save' ? 'directory' : 'file';
  const pickerTitle = title || (mode === 'save' ? '保存到云盘' : '从云盘打开');
  const choiceFileOnly = mode === 'open';
  const choiceDirOnly = mode === 'save';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] overflow-hidden">
        <lzc-file-picker
          type={pickerType}
          title={pickerTitle}
          accept={mode === 'open' ? accept : undefined}
          is-modal="true"
          choice-file-only={choiceFileOnly ? 'true' : 'false'}
          choice-dir-only={choiceDirOnly ? 'true' : 'false'}
          confirm-button-title={mode === 'save' ? '保存' : '打开'}
          multiple="false"
        />
      </div>
    </div>
  );
}