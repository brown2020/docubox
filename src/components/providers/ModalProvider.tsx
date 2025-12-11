"use client";

import { DeleteModal } from "@/components/DeleteModal";
import { RenameModal } from "@/components/RenameModal";
import { ShowParsedDataModal } from "@/components/ShowParsedDataModal";
import { QuestionAnswerModal } from "@/components/QuestionAnswerModal";
import { AddNewFolderModal } from "@/components/AddNewFolderModal";

/**
 * Centralized modal provider component.
 * Renders all application modals in a single location to prevent duplication.
 * Modals are controlled via Zustand stores (useModalStore, useFileSelectionStore).
 */
export function ModalProvider() {
  return (
    <>
      <DeleteModal />
      <RenameModal />
      <ShowParsedDataModal />
      <QuestionAnswerModal />
      <AddNewFolderModal />
    </>
  );
}
