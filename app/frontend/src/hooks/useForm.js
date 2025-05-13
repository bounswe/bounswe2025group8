import { useState, useCallback } from 'react';

/**
 * Form management hook for handling form state, validation and submission
 * @param {Object} initialValues - Initial form values
 * @param {Function} validate - Validation function returning errors object
 * @param {Function} onSubmit - Function to call on validated form submit
 * @returns {Object} Form methods and state
 */
const useForm = (initialValues = {}, validate = null, onSubmit = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle form field changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mark field as touched
    if (!touched[name]) {
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
    }
    
    // Clear field error when user starts typing again
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors, touched]);
  
  // Handle input blur for validation
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate single field if validate function is provided
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: validationErrors[name]
        }));
      }
    }
  }, [values, validate]);
  
  // Reset form to initial state
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);
  
  // Set specific form values
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  // Set specific form error
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);
  
  // Run validation on all fields
  const validateForm = useCallback(() => {
    if (!validate) return true;
    
    const validationErrors = validate(values);
    const hasErrors = Object.keys(validationErrors).length > 0;
    
    if (hasErrors) {
      setErrors(validationErrors);
      
      // Mark all fields with errors as touched
      const newTouched = { ...touched };
      Object.keys(validationErrors).forEach(key => {
        newTouched[key] = true;
      });
      setTouched(newTouched);
    }
    
    return !hasErrors;
  }, [values, validate, touched]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    // Don't submit if already submitting
    if (isSubmitting) return;
    
    // Validate form before submission
    const isValid = validateForm();
    
    if (isValid && onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [isSubmitting, validateForm, onSubmit, values]);
  
  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,
    
    // Form methods
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    validateForm
  };
};

export default useForm;