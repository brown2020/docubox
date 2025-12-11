"use client";

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

/**
 * Centralized modal provider with lazy loading.
 * Modals only render when their type is active.
 */
export function ModalProvider() {
  const openModal = useModalStore((state) => state.openModal);

  return (
    <>
      {openModal === "delete" && <DeleteModal />}
      {openModal === "rename" && <RenameModal />}
      {openModal === "parseData" && <ShowParsedDataModal />}
      {openModal === "questionAnswer" && <QuestionAnswerModal />}
      {openModal === "createFolder" && <AddNewFolderModal />}
    </>
  );
}
