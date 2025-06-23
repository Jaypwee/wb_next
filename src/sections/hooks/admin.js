import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import axios from 'src/lib/axios';

const uploadFile = async ({ type, file, files, seasonName, title, date }) => {
  const formData = new FormData();
  
  // Add metadata to formData
  formData.append('seasonName', seasonName);
  formData.append('title', title === 'inProgress' ? date?.toISOString().split('T')[0] : title);
  
  // Add file(s) to formData
  if (type === 'single') {
    formData.append('file', file);
  } else {
    files.forEach((f) => {
      formData.append('files', f);
    });
  }

  try {
    const response = await axios.post('/api/season/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || `Failed to upload ${type === 'single' ? 'file' : 'files'}`;
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
      if (variables.type === 'single') {
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

  const formatDate = (date) => {
    if (!date) return null;
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  const handleUpload = async (type, file, files) => {
    const seasonName = type === 'single' ? individualReportSeasonName : kvkReportSeasonName;
    const title = type === 'single' ? individualReportTitle : kvkReportTitle;
    const date = type === 'single' ? individualReportDate : kvkReportDate;

    if ((type === 'single' && !file) || (type === 'multiple' && !files.length)) return;

    uploadMutation.mutate({
      type,
      file,
      files,
      seasonName,
      title,
      date,
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