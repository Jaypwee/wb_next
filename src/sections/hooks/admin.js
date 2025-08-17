import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import axios from 'src/lib/axios';

const uploadFile = async ({ type, files, seasonName, title, date }) => {
  const formData = new FormData();
  
  // Add metadata to formData
  formData.append('seasonName', seasonName);
  formData.append('title', title === 'inProgress' ? date?.toISOString().split('T')[0] : title);
  formData.append('type', type === 'single' ? 'individual' : 'kvk');
  
  // Add files to formData
  files.forEach((file) => {
    formData.append('files', file);
  });

  try {
    const response = await axios.post('/api/season/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || `Failed to upload ${files.length === 1 ? 'file' : 'files'}`;
    throw new Error(errorMessage);
  }
};

export const useFileUpload = () => {
  const [singleFile, setSingleFile] = useState(null);
  const [multipleFiles, setMultipleFiles] = useState([]);

  const handleDelete = (type = 'single') => {
    if (type === 'single') {
      setSingleFile(null);
    } else {
      setMultipleFiles([]);
    }
  };

  const handleMultipleDelete = (fileToDelete) => {
    setMultipleFiles((prevFiles) => prevFiles.filter((f) => f !== fileToDelete));
  };

  const handleDrop = (acceptedFiles, type = 'single') => {
    if (type === 'single') {
      const newFile = acceptedFiles[0];
      if (newFile) {
        setSingleFile(newFile);
      }
    } else {
      setMultipleFiles((prevFiles) => {
        const existingFilenames = new Set(prevFiles.map((f) => f.name));
        const newFiles = acceptedFiles.filter((f) => !existingFilenames.has(f.name));
        return [...prevFiles, ...newFiles];
      });
    }
  };

  return {
    singleFile,
    multipleFiles,
    setSingleFile,
    setMultipleFiles,
    handleDelete,
    handleMultipleDelete,
    handleDrop,
  };
};

export const useReportUpload = () => {
  const [individualReportSeasonName, setIndividualReportSeasonName] = useState('');
  const [kvkReportSeasonName, setKvkReportSeasonName] = useState('');
  const [individualReportTitle, setIndividualReportTitle] = useState('');
  const [kvkReportTitle, setKvkReportTitle] = useState('');
  const [individualReportDate, setIndividualReportDate] = useState(null);
  const [kvkReportDate, setKvkReportDate] = useState(null);
  const { setSingleFile, setMultipleFiles } = useFileUpload();

  const uploadMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (_, variables) => {
      // Reset form immediately after successful upload
      if (variables.files.length === 1) {
        setIndividualReportSeasonName('');
        setIndividualReportTitle('');
        setIndividualReportDate(null);
        setSingleFile(null);
      } else {
        setKvkReportSeasonName('');
        setKvkReportTitle('');
        setKvkReportDate(null);
        setMultipleFiles([]);
      }
    },
  });

  const handleUpload = async (type, file, files) => {
    const seasonName = type === 'single' ? individualReportSeasonName : kvkReportSeasonName;
    const title = type === 'single' ? individualReportTitle : kvkReportTitle;
    const date = type === 'single' ? individualReportDate : kvkReportDate;

    // Normalize to always use an array of files
    const filesToUpload = type === 'single' ? [file] : files;
    
    if (!filesToUpload.length || (type === 'single' && !file)) return;

    uploadMutation.mutate({
      files: filesToUpload,
      seasonName,
      title,
      date,
      type
    });
  };

  return {
    individualReportSeasonName,
    setIndividualReportSeasonName,
    kvkReportSeasonName,
    setKvkReportSeasonName,
    individualReportTitle,
    setIndividualReportTitle,
    kvkReportTitle,
    setKvkReportTitle,
    individualReportDate,
    setIndividualReportDate,
    kvkReportDate,
    setKvkReportDate,
    handleUpload,
    uploadMutation,
  };
}; 