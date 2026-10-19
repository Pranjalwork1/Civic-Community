import React from 'react';
import { useCivic } from '../../context/CivicContext';
import { Step1CaptureEvidence } from './Step1CaptureEvidence';
import { Step2ConfirmLocation } from './Step2ConfirmLocation';
import { Step3AddDetails } from './Step3AddDetails';
import { Step4ReviewPublish } from './Step4ReviewPublish';

export const ReportWizard: React.FC = () => {
  const { wizardStep } = useCivic();

  switch (wizardStep) {
    case 1:
      return <Step1CaptureEvidence />;
    case 2:
      return <Step2ConfirmLocation />;
    case 3:
      return <Step3AddDetails />;
    case 4:
      return <Step4ReviewPublish />;
    default:
      return <Step1CaptureEvidence />;
  }
};
