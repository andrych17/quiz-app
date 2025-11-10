// Re-export all common UI components for easy importing
export { default as DataTable } from '../table/DataTable';
export type { Column, DataTableAction } from '../table/DataTable';

export { default as Tabs } from './Tabs';

export { 
  FormField, 
  TextField, 
  TextArea, 
  Select, 
  Button 
} from './FormControls';
export type { 
  FormFieldProps, 
  TextFieldProps, 
  TextAreaProps, 
  SelectProps, 
  SelectOption, 
  ButtonProps 
} from './FormControls';

export { Modal, ConfirmModal } from './Modal';
export type { ModalProps, ConfirmModalProps } from './Modal';

export { BaseForm } from './BaseForm';
export { BaseIndexForm } from './BaseIndexForm';
export { BaseEditForm } from './BaseEditForm';
