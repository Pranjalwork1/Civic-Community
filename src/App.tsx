import React from 'react';
import { useCivic } from './context/CivicContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { RightSidebar } from './components/layout/RightSidebar';
import { ExploreFeed } from './components/explore/ExploreFeed';
import { ReportWizard } from './components/report/ReportWizard';
import { IncidentDetailView } from './components/incident/IncidentDetailView';
import { IncidentRoomView } from './components/room/IncidentRoomView';
import { ComplaintDocView } from './components/complaint/ComplaintDocView';
import { LeaderApprovalView } from './components/complaint/LeaderApprovalView';
import { ComplaintTrackingView } from './components/tracking/ComplaintTrackingView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { ConsolidationModal } from './components/incident/ConsolidationModal';
import { DemoSimulationBar } from './components/demo/DemoSimulationBar';
import { LocationSelectModal } from './components/common/LocationSelectModal';

import { WindowHeaderBar } from './components/layout/WindowHeaderBar';
import { FloatingSideWidgets } from './components/layout/FloatingSideWidgets';

export const MainAppContent: React.FC = () => {
  const { activeView, isLocationModalOpen, setIsLocationModalOpen, selectedLocation } = useCivic();

  // On first launch if no location is stored, open location selection modal
  React.useEffect(() => {
    if (!selectedLocation) {
      setIsLocationModalOpen(true);
    }
  }, []);

  const renderActiveView = () => {
    switch (activeView) {
      case 'explore':
        return <ExploreFeed />;
      case 'report_wizard':
        return <ReportWizard />;
      case 'incident_detail':
        return <IncidentDetailView />;
      case 'incident_room':
        return <IncidentRoomView />;
      case 'complaint_doc':
        return <ComplaintDocView />;
      case 'leader_approval':
        return <LeaderApprovalView />;
      case 'tracking':
        return <ComplaintTrackingView />;
      case 'notifications':
        return <NotificationsView />;
      default:
        return <ExploreFeed />;
    }
  };

  return (
    <div className="desktop-scenic-viewport">
      {/* Scenic Backdrop Overlay for legibility & ambient depth */}
      <div className="scenic-backdrop-overlay" />

      {/* Outer Floating Companion Widgets on wide screens */}
      <FloatingSideWidgets />

      {/* Floating Rounded Application Workspace inspired by reference image */}
      <div className="floating-workspace-window">
        <WindowHeaderBar />
        <Navbar />

        <main className="main-layout">
          <Sidebar />
          {renderActiveView()}
          <RightSidebar />
        </main>
      </div>

      <ConsolidationModal />
      <LocationSelectModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
      <DemoSimulationBar />
    </div>
  );
};
