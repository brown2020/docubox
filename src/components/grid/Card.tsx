import { FileType } from "@/typings/filetype"
import { FunctionComponent } from "react"
import { COLOR_EXTENSION_MAP, UNCOMMON_EXTENSIONS_MAP } from "@/constants"
import { FileIcon, defaultStyles } from "react-file-icon"
import prettyBytes from "pretty-bytes"
import { Dot, EllipsisVertical, FolderOpen } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

type Props = {
  data: FileType
  openRenameModal: (fileId: string, filename: string, tags: string[]) => void
  openViewModal: (docId: string, filedata: string, summary: string) => void
  openDeleteModal: (fileId: string) => void
}
export const Card: FunctionComponent<Props> = ({
  data,
  openRenameModal,
  openViewModal,
  openDeleteModal,
}) => {
  const extension: string = data.type.split("/")[1]
  return (
    <TooltipProvider>
      <Tooltip>
        <div className="w-40 h-56 p-3 bg-white shadow-lg flex justify-between flex-col rounded-lg relative">
          <div className="ml-auto absolute top-1 right-1 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer" asChild>
                <EllipsisVertical color="#000" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() =>
                    openViewModal(data.id, data.unstructuredFile, data.summary)
                  }
                >
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    openRenameModal(data.id, data.filename, data.tags)
                  }
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openDeleteModal(data.id)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <TooltipTrigger>
            <div className="w-full p-6">
              {
                data.type === 'folder' ? (<FolderOpen size={90} />) : (<FileIcon
                extension={UNCOMMON_EXTENSIONS_MAP[extension] || extension}
                labelColor={
                  COLOR_EXTENSION_MAP[
                    UNCOMMON_EXTENSIONS_MAP[extension] || extension
                  ]
                }
                // @ts-expect-error: The 'defaultStyles' may not have a property for every possible extension.
                {...defaultStyles[
                  UNCOMMON_EXTENSIONS_MAP[extension] || extension
                ]}
              />)
              }
            </div>

            <div>
              <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                {data.filename}
              </p>
              <div className="flex items-center text-gray-500">
                <small className=" uppercase">{extension}</small> <Dot />
                <small>{prettyBytes(data.size)}</small>
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
              {prettyBytes(data.size)}
            </li>
            <li>
              <span className="text-gray-500">Type: </span>{" "}
              <span className="uppercase">{extension}</span>
            </li>
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
