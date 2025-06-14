"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useDropzone } from "@uploadthing/react";
import { ImageIcon, Loader2, X, Smile, AtSign, Hash } from "lucide-react";
import Image from "next/image";
import { ClipboardEvent, useRef } from "react";
import { useSubmitPostMutation } from "./mutations";
import "./styles.css";
import useMediaUpload, { Attachment } from "./useMediaUpload";

export default function PostEditor() {
  const { user } = useSession();

  // ✅ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const mutation = useSubmitPostMutation();

  const {
    startUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset: resetMediaUploads,
  } = useMediaUpload();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload,
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "What's happening?",
      }),
    ],
  });

  // ✅ CONDITIONAL RETURN AFTER ALL HOOKS
  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-4">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Please log in to create a post
        </p>
      </div>
    );
  }

  const { onClick, ...rootProps } = getRootProps();

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || "";

  function onSubmit() {
    mutation.mutate(
      {
        content: input,
        mediaIds: attachments.map((a) => a.mediaId).filter(Boolean) as string[],
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          resetMediaUploads();
        },
      },
    );
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile()) as File[];
    startUpload(files);
  }

  const characterCount = input.length;
  const maxCharacters = 280;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
        <UserAvatar 
          avatarUrl={user.avatarUrl} 
          size={44}
          className="ring-2 ring-white dark:ring-gray-800 shadow-sm" 
        />
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            {user.displayName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            @{user.username}
          </p>
        </div>
      </div>

      {/* Editor Section */}
      <div className="p-4">
        <div {...rootProps} className="w-full">
          <EditorContent
            editor={editor}
            className={cn(
              "max-h-[20rem] w-full overflow-y-auto rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-within:bg-white dark:focus-within:bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200",
              isDragActive && "outline-dashed outline-2 outline-blue-500 bg-blue-50 dark:bg-blue-900/20",
            )}
            onPaste={onPaste}
          />
          <input {...getInputProps()} />
        </div>

        {/* Character Counter */}
        {characterCount > 0 && (
          <div className="flex justify-end mt-2">
            <span className={cn(
              "text-xs font-medium",
              isOverLimit 
                ? "text-red-500" 
                : characterCount > maxCharacters * 0.8 
                  ? "text-yellow-500" 
                  : "text-gray-500 dark:text-gray-400"
            )}>
              {characterCount}/{maxCharacters}
            </span>
          </div>
        )}

        {/* Drag Active Overlay */}
        {isDragActive && (
          <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Drop your files here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Attachment Previews */}
      {!!attachments.length && (
        <div className="px-4 pb-4">
          <AttachmentPreviews
            attachments={attachments}
            removeAttachment={removeAttachment}
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1">
          <AddAttachmentsButton
            onFilesSelected={startUpload}
            disabled={isUploading || attachments.length >= 5}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            disabled={mutation.isPending}
          >
            <Smile className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-gray-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            disabled={mutation.isPending}
          >
            <AtSign className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            disabled={mutation.isPending}
          >
            <Hash className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {isUploading && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {uploadProgress ?? 0}%
              </span>
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            </div>
          )}
          <LoadingButton
            onClick={onSubmit}
            loading={mutation.isPending}
            disabled={!input.trim() || isUploading || isOverLimit}
            className={cn(
              "min-w-20 rounded-full font-semibold transition-all duration-200",
              (!input.trim() || isUploading || isOverLimit)
                ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transform hover:scale-105"
            )}
          >
            Post
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}

// Keep all other components (AddAttachmentsButton, AttachmentPreviews, AttachmentPreview) exactly the same
interface AddAttachmentsButtonProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

function AddAttachmentsButton({
  onFilesSelected,
  disabled,
}: AddAttachmentsButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-9 w-9 transition-colors",
          disabled 
            ? "text-gray-300 cursor-not-allowed" 
            : "text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        )}
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
      <input
        type="file"
        accept="image/*, video/*"
        multiple
        ref={fileInputRef}
        className="sr-only hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) {
            onFilesSelected(files);
            e.target.value = "";
          }
        }}
      />
    </>
  );
}

interface AttachmentPreviewsProps {
  attachments: Attachment[];
  removeAttachment: (fileName: string) => void;
}

function AttachmentPreviews({
  attachments,
  removeAttachment,
}: AttachmentPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl",
        attachments.length > 1 && "sm:grid sm:grid-cols-2",
      )}
    >
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.file.name}
          attachment={attachment}
          onRemoveClick={() => removeAttachment(attachment.file.name)}
        />
      ))}
    </div>
  );
}

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemoveClick: () => void;
}

function AttachmentPreview({
  attachment: { file, mediaId, isUploading },
  onRemoveClick,
}: AttachmentPreviewProps) {
  const src = URL.createObjectURL(file);

  return (
    <div
      className={cn(
        "relative mx-auto size-fit group",
        isUploading && "opacity-50"
      )}
    >
      {file.type.startsWith("image") ? (
        <Image
          src={src}
          alt="Attachment preview"
          width={500}
          height={500}
          className="size-fit max-h-[30rem] rounded-xl border border-gray-200 dark:border-gray-700"
        />
      ) : (
        <video 
          controls 
          className="size-fit max-h-[30rem] rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <source src={src} type={file.type} />
        </video>
      )}
      {!isUploading && (
        <button
          onClick={onRemoveClick}
          className="absolute right-2 top-2 rounded-full bg-black/70 hover:bg-black/90 p-1.5 text-white transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </div>
      )}
    </div>
  );
}
