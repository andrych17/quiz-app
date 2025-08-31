"use client";

import { ReactNode } from "react";
import { BaseForm } from "./BaseForm";

interface BaseEditFormProps {
  title: string;
  subtitle?: string;
  backUrl: string;
  backLabel?: string;
  // Edit or Create mode
  isCreateMode?: boolean;
  // Form data and actions
  onSave?: () => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  onCancel?: () => void;
  isSaving?: boolean;
  children: ReactNode;
  // Metadata props (only for edit mode)
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  isActive?: boolean;
  // Validation
  canSave?: boolean;
}

export function BaseEditForm({
  title,
  subtitle,
  backUrl,
  backLabel = "Back",
  isCreateMode = false,
  onSave,
  onDelete,
  onCancel,
  isSaving = false,
  children,
  createdAt,
  updatedAt,
  createdBy,
  updatedBy,
  isActive,
  canSave = true
}: BaseEditFormProps) {
  
  // For create mode, we're always in editing state
  const isEditing = isCreateMode ? true : true;
  
  // For create mode, we don't show delete button
  const showDeleteButton = !isCreateMode;

  return (
    <BaseForm
      title={title}
      subtitle={subtitle}
      backUrl={backUrl}
      backLabel={backLabel}
      onSave={canSave ? onSave : undefined}
      onDelete={showDeleteButton ? onDelete : undefined}
      onCancel={onCancel}
      isEditing={isEditing}
      isSaving={isSaving}
      showDeleteButton={showDeleteButton}
      createdAt={createdAt}
      updatedAt={updatedAt}
      createdBy={createdBy}
      updatedBy={updatedBy}
      isActive={isActive}
    >
      {children}
    </BaseForm>
  );
}
