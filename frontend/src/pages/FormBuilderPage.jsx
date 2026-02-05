import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, Reorder } from 'framer-motion';
import {
  Save,
  Play,
  Eye,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Settings2,
  Type,
  Hash,
  Calendar,
  List,
  CheckSquare,
  MapPin,
  Camera,
  Mic,
  FileText,
  Calculator,
  AlignLeft,
  Circle,
  Repeat
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useFormBuilderStore } from '../store';
import { formAPI } from '../lib/api';
import { generateId, cn } from '../lib/utils';
import { toast } from 'sonner';

const fieldTypes = [
  { type: 'text', label: 'Text', icon: Type },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'textarea', label: 'Long Text', icon: AlignLeft },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'select', label: 'Dropdown', icon: List },
  { type: 'radio', label: 'Single Choice', icon: Circle },
  { type: 'checkbox', label: 'Multiple Choice', icon: CheckSquare },
  { type: 'gps', label: 'GPS Location', icon: MapPin },
  { type: 'photo', label: 'Photo', icon: Camera },
  { type: 'audio', label: 'Audio', icon: Mic },
  { type: 'note', label: 'Note', icon: FileText },
  { type: 'calculate', label: 'Calculate', icon: Calculator },
  { type: 'group', label: 'Group', icon: Settings2 },
  { type: 'repeat', label: 'Repeat Group', icon: Repeat },
];

const FieldTypeButton = ({ type, label, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-2 p-3 rounded-sm border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
    data-testid={`add-field-${type}`}
  >
    <Icon className="w-5 h-5 text-muted-foreground" />
    <span className="text-xs">{label}</span>
  </button>
);

const FieldEditor = ({ field, onChange, onClose }) => {
  const [localField, setLocalField] = useState(field);
  const [options, setOptions] = useState(field.options || []);

  const handleSave = () => {
    onChange({ ...localField, options });
    onClose();
  };

  const addOption = () => {
    setOptions([...options, { value: `option_${options.length + 1}`, label: '', label_sw: '' }]);
  };

  const updateOption = (index, key, value) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [key]: value };
    setOptions(newOptions);
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const hasOptions = ['select', 'radio', 'checkbox', 'multiselect'].includes(field.type);

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="font-barlow">Edit Field</SheetTitle>
          <SheetDescription>Configure field properties</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-180px)] mt-6">
          <div className="space-y-6 pr-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Field Name (ID)</Label>
                <Input
                  value={localField.name}
                  onChange={(e) => setLocalField({ ...localField, name: e.target.value })}
                  placeholder="field_name"
                  data-testid="field-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Label (English)</Label>
                <Input
                  value={localField.label}
                  onChange={(e) => setLocalField({ ...localField, label: e.target.value })}
                  placeholder="Question text"
                  data-testid="field-label-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Label (Swahili)</Label>
                <Input
                  value={localField.label_sw || ''}
                  onChange={(e) => setLocalField({ ...localField, label_sw: e.target.value })}
                  placeholder="Swali kwa Kiswahili"
                  data-testid="field-label-sw-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Hint</Label>
                <Textarea
                  value={localField.hint || ''}
                  onChange={(e) => setLocalField({ ...localField, hint: e.target.value })}
                  placeholder="Additional instructions"
                  rows={2}
                />
              </div>
            </div>

            <Separator />

            {/* Options for select/radio/checkbox */}
            {hasOptions && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button variant="outline" size="sm" onClick={addOption}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {options.map((option, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={option.label}
                        onChange={(e) => updateOption(idx, 'label', e.target.value)}
                        placeholder="English"
                        className="flex-1"
                      />
                      <Input
                        value={option.label_sw || ''}
                        onChange={(e) => updateOption(idx, 'label_sw', e.target.value)}
                        placeholder="Swahili"
                        className="flex-1"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeOption(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasOptions && <Separator />}

            {/* Validation */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Validation</Label>
              <div className="flex items-center justify-between">
                <Label htmlFor="required" className="font-normal">Required</Label>
                <Switch
                  id="required"
                  checked={localField.validation?.required || false}
                  onCheckedChange={(checked) => 
                    setLocalField({
                      ...localField,
                      validation: { ...localField.validation, required: checked }
                    })
                  }
                />
              </div>
              {(field.type === 'text' || field.type === 'textarea') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Min Length</Label>
                      <Input
                        type="number"
                        value={localField.validation?.min_length || ''}
                        onChange={(e) => 
                          setLocalField({
                            ...localField,
                            validation: { ...localField.validation, min_length: parseInt(e.target.value) || null }
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Length</Label>
                      <Input
                        type="number"
                        value={localField.validation?.max_length || ''}
                        onChange={(e) => 
                          setLocalField({
                            ...localField,
                            validation: { ...localField.validation, max_length: parseInt(e.target.value) || null }
                          })
                        }
                      />
                    </div>
                  </div>
                </>
              )}
              {field.type === 'number' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min Value</Label>
                    <Input
                      type="number"
                      value={localField.validation?.min_value || ''}
                      onChange={(e) => 
                        setLocalField({
                          ...localField,
                          validation: { ...localField.validation, min_value: parseFloat(e.target.value) || null }
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Value</Label>
                    <Input
                      type="number"
                      value={localField.validation?.max_value || ''}
                      onChange={(e) => 
                        setLocalField({
                          ...localField,
                          validation: { ...localField.validation, max_value: parseFloat(e.target.value) || null }
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Skip Logic */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Skip Logic (Optional)</Label>
              <div className="space-y-2">
                <Label>Show if field</Label>
                <Input
                  value={localField.logic?.show_if || ''}
                  onChange={(e) => 
                    setLocalField({
                      ...localField,
                      logic: { ...localField.logic, show_if: e.target.value }
                    })
                  }
                  placeholder="field_name"
                />
              </div>
              <div className="space-y-2">
                <Label>Equals value</Label>
                <Input
                  value={localField.logic?.show_value || ''}
                  onChange={(e) => 
                    setLocalField({
                      ...localField,
                      logic: { ...localField.logic, show_value: e.target.value }
                    })
                  }
                  placeholder="value"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave} data-testid="save-field-btn">
                Save Field
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

const FieldRow = ({ field, onEdit, onRemove, dragControls }) => {
  const Icon = fieldTypes.find(f => f.type === field.type)?.icon || Type;

  return (
    <motion.div
      className="flex items-center gap-3 p-4 bg-card/50 border border-border/50 rounded-sm hover:border-primary/50 transition-all group"
      layout
    >
      <div className="cursor-grab active:cursor-grabbing" {...dragControls}>
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{field.label || field.name}</p>
        <p className="text-xs text-muted-foreground">{field.type} • {field.name}</p>
      </div>
      {field.validation?.required && (
        <span className="text-xs text-red-500">Required</span>
      )}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" onClick={() => onEdit(field)}>
          <Settings2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onRemove(field.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export function FormBuilderPage() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const {
    currentForm,
    fields,
    isDirty,
    setForm,
    setFields,
    addField,
    updateField,
    removeField,
    markClean
  } = useFormBuilderStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    setLoading(true);
    try {
      const response = await formAPI.get(formId);
      setForm(response.data);
      setFormName(response.data.name);
      setFormDescription(response.data.description || '');
    } catch (error) {
      toast.error('Failed to load form');
      navigate('/forms');
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = (type) => {
    const newField = {
      id: generateId(),
      type,
      name: `field_${fields.length + 1}`,
      label: '',
      label_sw: '',
      hint: '',
      options: [],
      validation: { required: false },
      logic: null,
      order: fields.length
    };
    addField(newField);
    setEditingField(newField);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await formAPI.update(formId, {
        name: formName,
        description: formDescription,
        project_id: currentForm.project_id,
        fields,
        default_language: currentForm.default_language || 'en',
        languages: currentForm.languages || ['en', 'sw']
      });
      markClean();
      toast.success('Form saved');
    } catch (error) {
      toast.error('Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (fields.length === 0) {
      toast.error('Add at least one field before publishing');
      return;
    }
    try {
      // Save first
      await handleSave();
      // Then publish
      await formAPI.publish(formId);
      toast.success('Form published!');
      navigate('/forms');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to publish');
    }
  };

  const handleFieldUpdate = (updatedField) => {
    updateField(updatedField.id, updatedField);
  };

  const handleReorder = (newOrder) => {
    const reorderedFields = newOrder.map((field, index) => ({
      ...field,
      order: index
    }));
    setFields(reorderedFields);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading form...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="form-builder-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/forms')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="font-barlow text-2xl font-bold border-0 border-b border-transparent hover:border-border focus:border-primary bg-transparent px-0 h-auto text-white"
                placeholder="Form Name"
                data-testid="form-title-input"
              />
              <p className="text-sm text-gray-400 mt-1">
                {currentForm?.status} • v{currentForm?.version}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/forms/${formId}/preview`)}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={handleSave} disabled={saving || !isDirty} data-testid="save-form-btn">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button onClick={handlePublish} data-testid="publish-form-btn">
              <Play className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Field Types Palette */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="font-barlow text-lg text-white">Add Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {fieldTypes.map((ft) => (
                  <FieldTypeButton
                    key={ft.type}
                    type={ft.type}
                    label={ft.label}
                    icon={ft.icon}
                    onClick={() => handleAddField(ft.type)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form Canvas */}
          <div className="lg:col-span-3">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 min-h-[60vh]">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-barlow text-lg">Form Fields</CardTitle>
                  <span className="text-sm text-muted-foreground">{fields.length} fields</span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {fields.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-barlow text-lg font-semibold mb-2">No fields yet</h3>
                    <p className="text-muted-foreground max-w-md">
                      Click on field types on the left to add questions to your form
                    </p>
                  </div>
                ) : (
                  <Reorder.Group axis="y" values={fields} onReorder={handleReorder} className="space-y-2">
                    {fields.map((field) => (
                      <Reorder.Item key={field.id} value={field}>
                        <FieldRow
                          field={field}
                          onEdit={setEditingField}
                          onRemove={removeField}
                        />
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Field Editor Sheet */}
        {editingField && (
          <FieldEditor
            field={editingField}
            onChange={handleFieldUpdate}
            onClose={() => setEditingField(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
