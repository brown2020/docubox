"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useModalStore } from "@/zustand/useModalStore";
import { LoadingState } from "@/components/common/LoadingState";

// Dynamic imports for performance - modals only load when needed
const DeleteModal = dynamic(
  () =>
    import("@/components/DeleteModal").then((m) => ({
      default: m.DeleteModal,
    })),
  { loading: () => null }
);

const RenameModal = dynamic(
  () =>
    import("@/components/RenameModal").then((m) => ({
      default: m.RenameModal,
    })),
  { loading: () => null }
);

const ShowParsedDataModal = dynamic(
  () =>
    import("@/components/ShowParsedDataModal").then((m) => ({
      default: m.ShowParsedDataModal,
    })),
  { loading: () => <LoadingState message="Loading..." size={24} /> }
);

const QuestionAnswerModal = dynamic(
  () =>
    import("@/components/QuestionAnswerModal").then((m) => ({
      default: m.QuestionAnswerModal,
    })),
  { loading: () => <LoadingState message="Loading..." size={24} /> }
);

const AddNewFolderModal = dynamic(
  () =>
    import("@/components/AddNewFolderModal").then((m) => ({
      default: m.AddNewFolderModal,
    })),
  { loading: () => null }
);

const FilePreviewModal = dynamic(
  () =>
    import("@/components/FilePreviewModal").then((m) => ({
      default: m.FilePreviewModal,
    })),
  { loading: () => null }
);

/**
 * Centralized modal provider with lazy loading.
 * Modals only render when their type is active.
 * Automatically closes modals on route changes to prevent stale state.
 */
export function ModalProvider() {
  const openModal = useModalStore((state) => state.openModal);
  const close = useModalStore((state) => state.close);
  const pathname = usePathname();

  // Close any open modal when route changes to prevent stale modal state
  useEffect(() => {
    if (openModal) {
      close();
    }
    // Only run when pathname changes, not when openModal changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {openModal === "delete" && <DeleteModal />}
      {openModal === "rename" && <RenameModal />}
      {openModal === "parseData" && <ShowParsedDataModal />}
      {openModal === "questionAnswer" && <QuestionAnswerModal />}
      {openModal === "createFolder" && <AddNewFolderModal />}
      {openModal === "preview" && <FilePreviewModal />}
    </>
  );
}
