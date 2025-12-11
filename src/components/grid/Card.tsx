import { FileType } from "@/types/filetype";
import { FunctionComponent } from "react";
import prettyBytes from "pretty-bytes";
import { EllipsisVertical } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { FileTypeIcon } from "@/components/common/FileTypeIcon";

type Props = {
  data: FileType;
  openRenameModal: (fileId: string, filename: string, tags: string[]) => void;
  openViewModal: (docId: string, filedata: string, summary: string) => void;
  openDeleteModal: () => void;
};

export const Card: FunctionComponent<Props> = ({
  data,
  openRenameModal,
  openViewModal,
  openDeleteModal,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <div className="w-40 h-56 p-3 flex justify-between flex-col rounded-lg relative border">
          <div className="ml-auto absolute top-1 right-1 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer" asChild>
                <EllipsisVertical />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {data.type !== "folder" && (
                  <DropdownMenuItem
                    onClick={() =>
                      openViewModal(
                        data.docId,
                        data.unstructuredFile,
                        data.summary
                      )
                    }
                  >
                    View
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() =>
                    openRenameModal(data.docId, data.filename, data.tags)
                  }
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openDeleteModal}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <TooltipTrigger className="flex flex-col h-full justify-between">
            <div className="w-full p-6">
              <FileTypeIcon type={data.type} size={90} className="w-full" />
            </div>

            <div className="w-full">
              <p className="overflow-hidden text-ellipsis whitespace-nowrap w-full">
                {data.filename}
              </p>
              <div className="flex items-center text-gray-500">
                <small>
                  {data.size !== 0 ? prettyBytes(data.size) : "Empty Folder"}
                </small>
              </div>
            </div>
          </TooltipTrigger>
        </div>
        <TooltipContent side={"right"}>
          <ul>
            <li>
              <span className="text-gray-500">File Name:</span> {data.filename}
            </li>
            <li>
              <span className="text-gray-500">Uploaded by: </span>{" "}
              {data.fullName}
            </li>
            <li>
              <span className="text-gray-500">Date Uploaded: </span>{" "}
              {new Date(data.timestamp).toLocaleDateString()}{" "}
              {new Date(data.timestamp).toLocaleTimeString()}
            </li>
            <li>
              <span className="text-gray-500">Size:</span>{" "}
              {data.size !== 0 ? prettyBytes(data.size) : "Empty Folder"}
            </li>
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
