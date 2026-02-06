"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Copy, Link2, Link2Off, Loader2, Share2 } from "lucide-react";
import { fileService } from "@/services/fileService";
import { useUser } from "@/components/auth";
import toast from "react-hot-toast";
import { logger } from "@/lib/logger";

interface SharePopoverProps {
  fileId: string;
  shareToken: string | null;
  shareEnabled: boolean;
}

/**
 * Popover for creating, copying, and revoking share links.
 */
export function SharePopover({
  fileId,
  shareToken,
  shareEnabled,
}: SharePopoverProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localToken, setLocalToken] = useState(shareToken);
  const [localEnabled, setLocalEnabled] = useState(shareEnabled);

  const shareUrl =
    localToken && typeof window !== "undefined"
      ? `${window.location.origin}/share/${localToken}`
      : null;

  const handleCreateLink = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await fileService.createShareLink(user.id, fileId);
      setLocalToken(token);
      setLocalEnabled(true);
      toast.success("Share link created!");
    } catch (error) {
      logger.error("SharePopover", "Failed to create share link", error);
      toast.error("Failed to create share link.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisableLink = async () => {
    if (!user || !localToken) return;
    setLoading(true);
    try {
      await fileService.disableShareLink(user.id, fileId, localToken);
      setLocalToken(null);
      setLocalEnabled(false);
      toast.success("Share link disabled.");
    } catch (error) {
      logger.error("SharePopover", "Failed to disable share link", error);
      toast.error("Failed to disable share link.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="text-blue-500 hover:bg-blue-100"
          aria-label="Share file"
        >
          <Share2 size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Share file</h4>
          </div>

          {localEnabled && shareUrl ? (
            <>
              {/* Link display + copy */}
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0 rounded-md border bg-muted/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground truncate">
                    {shareUrl}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={handleCopy}
                  disabled={loading}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Anyone with this link can view and download this file.
              </p>

              {/* Disable link */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive"
                onClick={handleDisableLink}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Link2Off className="h-4 w-4 mr-1.5" />
                )}
                Disable link
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Create a public link to share this file. Anyone with the link
                can view and download it — no account required.
              </p>
              <Button
                className="w-full"
                size="sm"
                onClick={handleCreateLink}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4 mr-1.5" />
                )}
                Create link
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
