import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { cloudFunctions } from '../utils/cloudFunctions';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Edit, 
  Save, 
  Eye, 
  X, 
  Plus,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Info,
  MousePointer,
  GripVertical
} from 'lucide-react';

const EmailTemplateManager = ({ isOpen, onClose }) => {
  const { userProfile } = useAuth();
  const [templates, setTemplates] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [showVariableGuide, setShowVariableGuide] = useState(false);
  const [draggedVariable, setDraggedVariable] = useState(null);
  const textareaRef = useRef(null);

  const templateTypes = [
    { id: 'welcome', name: 'Welcome Email', description: 'Sent to candidates when activated' },
    { id: 'paymentReminder', name: 'Payment Reminder', description: 'Sent to candidates with pending payments' },
    { id: 'eLearningReminder', name: 'E-Learning Reminder', description: 'Sent to candidates with incomplete e-learning' },
    { id: 'courseReminder', name: 'Course Reminder', description: 'Final reminder before course' },
    { id: 'supervisorNotification', name: 'Supervisor Notification', description: 'Sent to supervisors for unsuccessful candidates' }
  ];

  // Comprehensive variable reference with descriptions
  const variableReference = {
    candidate: {
      title: 'Candidate Information',
      variables: {
        firstName: { description: 'Candidate\'s first name', example: 'John' },
        surname: { description: 'Candidate\'s surname', example: 'Doe' },
        email: { description: 'Candidate\'s email address', example: 'john.doe@nhs.net' },
        candidateName: { description: 'Full candidate name', example: 'John Doe' },
        gmcNumber: { description: 'GMC registration number', example: '12345678' }
      }
    },
    course: {
      title: 'Course Information',
      variables: {
        courseName: { description: 'Name of the course', example: 'IMPACT Course' },
        courseDate: { description: 'Course start date', example: '2024-06-15' },
        venue: { description: 'Course venue/location', example: 'Whiston Hospital' },
        courseCost: { description: 'Course cost', example: '£500' },
        eLearningUrl: { description: 'E-learning platform URL', example: 'https://e-learning.example.com' }
      }
    },
    account: {
      title: 'Account Information',
      variables: {
        generatedPassword: { description: 'Generated login password', example: 'TempPass123' },
        username: { description: 'Login username (usually email)', example: 'john.doe@nhs.net' }
      }
    },
    assessment: {
      title: 'Assessment Information',
      variables: {
        reason: { description: 'Reason for unsuccessful assessment', example: 'Failed practical assessment' },
        supervisorName: { description: 'Supervisor\'s name', example: 'Dr. Smith' }
      }
    }
  };

  // Default email templates
  const defaultTemplates = {
    welcome: {
      subject: 'Welcome to IMPACT Course - Your Account is Ready',
      body: `Dear {{firstName}} {{surname}},

Welcome to the IMPACT Course! Your payment has been confirmed and your account has been activated.

Your login credentials are:
Username: {{email}}
Password: {{generatedPassword}}

Please log in to access your course materials and programme at: https://mwl-impact.web.app

Course Details:
- Course: {{courseName}}
- Date: {{courseDate}}
- Venue: {{venue}}

If you have any questions, please don't hesitate to contact us.

Best regards,
IMPACT Course Team
Whiston Hospital`,
      variables: ['firstName', 'surname', 'email', 'generatedPassword', 'courseName', 'courseDate', 'venue']
    },
    paymentReminder: {
      subject: 'IMPACT Course - Payment Reminder',
      body: `Dear {{firstName}} {{surname}},

This is a friendly reminder that payment for the IMPACT Course is still pending.

Course Details:
- Course: {{courseName}}
- Date: {{courseDate}}
- Venue: {{venue}}
- Cost: {{courseCost}}

Please complete your payment to secure your place on the course. Once payment is confirmed, you will receive your login credentials and access to course materials.

If you have any questions about payment, please contact us immediately.

Best regards,
IMPACT Course Team
Whiston Hospital`,
      variables: ['firstName', 'surname', 'courseName', 'courseDate', 'venue', 'courseCost']
    },
    eLearningReminder: {
      subject: 'IMPACT Course - E-Learning Reminder',
      body: `Dear {{firstName}} {{surname}},

This is a reminder to complete your e-learning modules before the IMPACT Course.

You can access the e-learning materials at: {{eLearningUrl}}

Please ensure all modules are completed before the course start date: {{courseDate}}

If you have any technical issues accessing the e-learning platform, please contact us for assistance.

Best regards,
IMPACT Course Team
Whiston Hospital`,
      variables: ['firstName', 'surname', 'eLearningUrl', 'courseDate']
    },
    courseReminder: {
      subject: 'IMPACT Course - Final Reminder',
      body: `Dear {{firstName}} {{surname}},

This is your final reminder for the IMPACT Course starting tomorrow.

Course Details:
- Date: {{courseDate}}
- Venue: {{venue}}
- Start Time: 9:00 AM

Please ensure you have:
- Completed all e-learning modules
- Brought any required documentation
- Arrived 15 minutes before the start time

If you have any questions or need to make changes, please contact us immediately.

We look forward to seeing you!

Best regards,
IMPACT Course Team
Whiston Hospital`,
      variables: ['firstName', 'surname', 'courseDate', 'venue']
    },
    supervisorNotification: {
      subject: 'IMPACT Course - Assessment Update for {{candidateName}}',
      body: `Dear {{supervisorName}},

This is to inform you about the assessment outcome for {{candidateName}} (GMC: {{gmcNumber}}) who attended the IMPACT Course.

Assessment Result: Unsuccessful

Reason: {{reason}}

The candidate has been informed of this outcome and provided with guidance on next steps.

If you have any questions or need further information, please don't hesitate to contact us.

Best regards,
IMPACT Course Team
Whiston Hospital`,
      variables: ['supervisorName', 'candidateName', 'gmcNumber', 'reason']
    }
  };

  const sampleData = {
    firstName: 'John',
    surname: 'Doe',
    email: 'john.doe@nhs.net',
    generatedPassword: 'TempPass123',
    courseDate: '2024-06-15',
    venue: 'Whiston Hospital',
    courseCost: '£500',
    eLearningUrl: 'https://e-learning.example.com',
    supervisorName: 'Dr. Smith',
    candidateName: 'John Doe',
    gmcNumber: '12345678',
    reason: 'Failed practical assessment',
    courseName: 'IMPACT Course',
    username: 'john.doe@nhs.net'
  };

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const result = await cloudFunctions.getEmailTemplates();
      if (result.success) {
        // Merge fetched templates with default templates
        // If a template exists in the database, use it; otherwise, use the default
        const mergedTemplates = {};
        Object.keys(defaultTemplates).forEach(templateId => {
          if (result.templates && result.templates[templateId]) {
            // Use saved template from database
            mergedTemplates[templateId] = result.templates[templateId];
          } else {
            // Use default template
            mergedTemplates[templateId] = {
              ...defaultTemplates[templateId],
              id: templateId,
              isDefault: true
            };
          }
        });
        setTemplates(mergedTemplates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load email templates');
      // Fallback to default templates if fetch fails
      const fallbackTemplates = {};
      Object.keys(defaultTemplates).forEach(templateId => {
        fallbackTemplates[templateId] = {
          ...defaultTemplates[templateId],
          id: templateId,
          isDefault: true
        };
      });
      setTemplates(fallbackTemplates);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (templateId) => {
    const template = templates[templateId] || {
      subject: '',
      body: '',
      variables: []
    };
    
    // Ensure variables are extracted from the template content
    const extractedVariables = extractVariables(template.body || '');
    const finalTemplate = {
      id: templateId,
      subject: template.subject || '',
      body: template.body || '',
      variables: template.variables || extractedVariables
    };
    
    setEditingTemplate(finalTemplate);
    setSelectedTemplate(templateId);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;

    try {
      setSaving(true);
      const result = await cloudFunctions.updateEmailTemplate(
        editingTemplate.id,
        {
          subject: editingTemplate.subject,
          body: editingTemplate.body,
          variables: editingTemplate.variables,
          updatedAt: new Date(),
          updatedBy: userProfile?.firstName ? `${userProfile.firstName} ${userProfile.surname}` : 'Admin'
        }
      );

      if (result.success) {
        toast.success('Template saved successfully');
        setTemplates(prev => ({
          ...prev,
          [editingTemplate.id]: editingTemplate
        }));
        setEditingTemplate(null);
        setSelectedTemplate(null);
      } else {
        toast.error('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewTemplate = (templateId) => {
    const template = templates[templateId];
    if (!template) return;

    setPreviewData(sampleData);
    setSelectedTemplate(templateId);
    setPreviewMode(true);
  };

  const generatePreview = (content) => {
    if (!content) return '';
    let preview = content;
    const dataToUse = Object.keys(previewData).length > 0 ? previewData : sampleData;
    
    // Safely replace variables
    Object.keys(dataToUse).forEach(key => {
      try {
        const regex = new RegExp(`{{${key}}}`, 'g');
        preview = preview.replace(regex, dataToUse[key] || '');
      } catch (error) {
        console.warn(`Error replacing variable ${key}:`, error);
        // Fallback: replace with empty string
        preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), '');
      }
    });
    
    return preview;
  };

  const handleDuplicateTemplate = (templateId) => {
    const template = templates[templateId];
    if (!template) return;

    const newId = `${templateId}_copy_${Date.now()}`;
    setEditingTemplate({
      id: newId,
      subject: `${template.subject} (Copy)`,
      body: template.body,
      variables: template.variables
    });
    setSelectedTemplate(newId);
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const result = await cloudFunctions.updateEmailTemplate(templateId, null);
      if (result.success) {
        toast.success('Template deleted successfully');
        const newTemplates = { ...templates };
        delete newTemplates[templateId];
        setTemplates(newTemplates);
        if (selectedTemplate === templateId) {
          setSelectedTemplate(null);
          setEditingTemplate(null);
        }
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const extractVariables = (content) => {
    const regex = /\{\{(\w+)\}\}/g;
    const variables = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    return variables;
  };

  const handleContentChange = (field, value) => {
    if (!editingTemplate) return;

    const updatedTemplate = {
      ...editingTemplate,
      [field]: value
    };

    if (field === 'body') {
      updatedTemplate.variables = extractVariables(value);
    }

    setEditingTemplate(updatedTemplate);
  };

  // Drag and drop functionality
  const handleDragStart = (e, variable) => {
    setDraggedVariable(variable);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e, field) => {
    e.preventDefault();
    if (!draggedVariable || !editingTemplate) return;

    const variableText = `{{${draggedVariable}}}`;
    const textarea = textareaRef.current;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = editingTemplate[field];
      const newValue = currentValue.substring(0, start) + variableText + currentValue.substring(end);
      
      handleContentChange(field, newValue);
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variableText.length, start + variableText.length);
      }, 0);
    }
    
    setDraggedVariable(null);
  };

  const insertVariableAtCursor = (variable) => {
    if (!editingTemplate || !textareaRef.current) return;

    const variableText = `{{${variable}}}`;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = editingTemplate.body;
    const newValue = currentValue.substring(0, start) + variableText + currentValue.substring(end);
    
    handleContentChange('body', newValue);
    
    // Set cursor position after the inserted variable
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variableText.length, start + variableText.length);
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[95vh] mx-4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-nhs-dark-grey">Email Template Management</h2>
            <p className="text-nhs-grey">Manage and edit email templates for automated communications</p>
          </div>
          <button
            onClick={onClose}
            className="text-nhs-mid-grey hover:text-nhs-dark-grey"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-nhs-dark-grey mb-2">Template Types</h3>
              <p className="text-sm text-nhs-grey">Select a template to edit or preview</p>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nhs-blue mx-auto"></div>
                <p className="text-nhs-grey mt-2">Loading templates...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {templateTypes.map((type) => {
                  const template = templates[type.id];
                  const isSelected = selectedTemplate === type.id;
                  const isEditing = editingTemplate?.id === type.id;

                  return (
                    <div
                      key={type.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-nhs-blue bg-nhs-blue bg-opacity-10'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => handleEditTemplate(type.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-nhs-dark-grey">{type.name}</h4>
                          <p className="text-xs text-nhs-grey mt-1">{type.description}</p>
                          {template && (
                            <p className="text-xs text-nhs-green mt-1">
                              Last updated: {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'Unknown'}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          {template && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreviewTemplate(type.id);
                                }}
                                className="p-1 text-nhs-mid-grey hover:text-nhs-blue"
                                title="Preview"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicateTemplate(type.id);
                                }}
                                className="p-1 text-nhs-mid-grey hover:text-nhs-blue"
                                title="Duplicate"
                              >
                                <Copy size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTemplate(type.id);
                                }}
                                className="p-1 text-nhs-mid-grey hover:text-nhs-red"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                          {isEditing && <Check size={16} className="text-nhs-green" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {previewMode ? (
              /* Preview Mode */
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-nhs-dark-grey">
                    Preview: {templateTypes.find(t => t.id === selectedTemplate)?.name}
                  </h3>
                  <button
                    onClick={() => setPreviewMode(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Exit Preview
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="mb-4">
                    <h4 className="font-medium text-nhs-dark-grey mb-2">Subject:</h4>
                    <p className="text-gray-700">{generatePreview(templates[selectedTemplate]?.subject || '')}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-nhs-dark-grey mb-2">Body:</h4>
                    <div 
                      className="text-gray-700 whitespace-pre-wrap border border-gray-200 rounded p-4 bg-gray-50"
                      dangerouslySetInnerHTML={{ 
                        __html: generatePreview(templates[selectedTemplate]?.body || '').replace(/\n/g, '<br>') 
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : editingTemplate ? (
              /* Edit Mode */
              <div className="flex-1 flex overflow-hidden">
                {/* Variable Reference Panel */}
                <div className="w-96 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-nhs-dark-grey">Variable Reference</h3>
                      <button
                        onClick={() => setShowVariableGuide(!showVariableGuide)}
                        className="text-nhs-blue hover:text-nhs-dark-blue"
                        title="Show/Hide Guide"
                      >
                        <Info size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-nhs-grey">Drag variables to insert them</p>
                  </div>

                  {showVariableGuide && (
                    <div className="mb-4 p-3 bg-nhs-pale-grey border-l-4 border-nhs-blue rounded">
                      <h4 className="text-sm font-medium text-nhs-blue mb-2">How to use variables:</h4>
                      <ul className="text-xs text-nhs-grey space-y-1">
                        <li>• Drag and drop variables into the text area</li>
                        <li>• Or click on a variable to insert it at cursor position</li>
                        <li>• Variables will be replaced with actual data when emails are sent</li>
                      </ul>
                    </div>
                  )}

                  <div className="space-y-4">
                    {Object.entries(variableReference).map(([category, categoryData]) => (
                      <div key={category} className="bg-white rounded-lg border border-gray-200 p-3">
                        <h4 className="font-medium text-nhs-dark-grey mb-3">{categoryData.title}</h4>
                        <div className="space-y-2">
                          {Object.entries(categoryData.variables).map(([variable, variableData]) => (
                            <div
                              key={variable}
                              draggable
                              onDragStart={(e) => handleDragStart(e, variable)}
                              onClick={() => insertVariableAtCursor(variable)}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors group"
                            >
                              <div className="flex items-center space-x-2">
                                <GripVertical size={14} className="text-nhs-mid-grey group-hover:text-nhs-blue" />
                                <code className="text-sm font-mono bg-white px-2 py-1 rounded border text-nhs-blue">
                                  {`{{${variable}}}`}
                                </code>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-nhs-dark-grey font-medium">{variableData.description}</p>
                                <p className="text-xs text-nhs-grey">Example: {variableData.example}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Edit Form */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-nhs-dark-grey">
                      Edit: {templateTypes.find(t => t.id === editingTemplate.id)?.name}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePreviewTemplate(editingTemplate.id)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center"
                      >
                        <Eye size={16} className="mr-2" />
                        Preview
                      </button>
                      <button
                        onClick={handleSaveTemplate}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} className="mr-2" />
                            Save Template
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                        Email Subject
                      </label>
                      <input
                        type="text"
                        value={editingTemplate.subject}
                        onChange={(e) => handleContentChange('subject', e.target.value)}
                        className="input-field"
                        placeholder="Enter email subject"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'subject')}
                      />
                    </div>

                    {/* Body */}
                    <div>
                      <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                        Email Body
                      </label>
                      <textarea
                        ref={textareaRef}
                        value={editingTemplate.body}
                        onChange={(e) => handleContentChange('body', e.target.value)}
                        className="input-field h-96 resize-none"
                        placeholder="Enter email body content. Drag variables from the panel or click to insert them."
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'body')}
                      />
                    </div>

                    {/* Variables Used */}
                    {editingTemplate.variables && editingTemplate.variables.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-nhs-dark-grey mb-2">
                          Variables Used in Template
                        </label>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex flex-wrap gap-2">
                            {editingTemplate.variables.map((variable) => (
                              <div key={variable} className="flex items-center space-x-2 bg-white px-3 py-2 rounded border">
                                <code className="text-sm font-mono text-nhs-blue">
                                  {`{{${variable}}}`}
                                </code>
                                <span className="text-xs text-nhs-grey">
                                  {sampleData[variable] ? `(${sampleData[variable]})` : '(not available)'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* No Selection */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FileText size={48} className="text-nhs-mid-grey mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-nhs-dark-grey mb-2">Select a Template</h3>
                  <p className="text-nhs-grey">Choose a template from the sidebar to edit or preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateManager;
