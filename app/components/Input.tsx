import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Platform,
  Animated,
  AccessibilityRole,
  AccessibilityState
} from 'react-native';
import { Eye, EyeOff, X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeProvider';
import Typography from './Typography';

export type InputVariant = 'default' | 'filled' | 'outline';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: InputVariant;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showClearButton?: boolean;
  isPassword?: boolean;
  fullWidth?: boolean;
  containerStyle?: any;
}

export interface InputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  isFocused: () => boolean;
}

/**
 * Input component for text entry with consistent styling
 * Supports various variants, sizes, and states with accessibility features
 */
const Input = forwardRef<InputRef, InputProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  showClearButton = false,
  isPassword = false,
  fullWidth = true,
  containerStyle,
  style,
  value,
  onChangeText,
  placeholder,
  placeholderTextColor,
  ...props
}, ref) => {
  const { colors, isDarkMode } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);
  const inputRef = useRef<TextInput>(null);
  const focusAnim = useRef(new Animated.Value(0)).current;

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    blur: () => {
      inputRef.current?.blur();
    },
    clear: () => {
      inputRef.current?.clear();
      onChangeText && onChangeText('');
    },
    isFocused: () => {
      return !!inputRef.current?.isFocused();
    }
  }));

  // Animate focus state
  React.useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, focusAnim]);

  // Get border color based on state
  const getBorderColor = () => {
    if (error) return colors.error;
    if (isFocused) return colors.primary;
    return isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
  };

  // Get background color based on variant
  const getBackgroundColor = () => {
    if (variant === 'filled') {
      return isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    }
    return 'transparent';
  };

  // Get padding based on size
  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingVertical: 6, paddingHorizontal: 8, fontSize: 14 };
      case 'lg': return { paddingVertical: 14, paddingHorizontal: 16, fontSize: 18 };
      default: return { paddingVertical: 10, paddingHorizontal: 12, fontSize: 16 };
    }
  };

  const { paddingVertical, paddingHorizontal, fontSize } = getPadding();
  const borderColor = getBorderColor();
  const backgroundColor = getBackgroundColor();

  // Handle focus and blur
  const handleFocus = (e: any) => {
    setIsFocused(true);
    props.onFocus && props.onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    props.onBlur && props.onBlur(e);
  };

  // Handle clear button press
  const handleClear = () => {
    inputRef.current?.clear();
    onChangeText && onChangeText('');
    inputRef.current?.focus();
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Get accessibility state
  const getAccessibilityState = (): AccessibilityState => {
    return {
      disabled: props.editable === false,
      checked: !!value && value.length > 0,
    };
  };

  return (
    <View style={[
      styles.container,
      { width: fullWidth ? '100%' : 'auto' },
      containerStyle
    ]}>
      {label && (
        <Typography 
          variant="bodySmall" 
          style={[
            styles.label,
            { color: error ? colors.error : colors.textSecondary }
          ]}
        >
          {label}
        </Typography>
      )}

      <View style={[
        styles.inputContainer,
        {
          borderColor,
          backgroundColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderBottomWidth: variant === 'default' ? 1 : variant === 'outline' ? 1 : 0,
        }
      ]}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}

        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              paddingVertical,
              paddingLeft: leftIcon ? 0 : paddingHorizontal,
              paddingRight: (rightIcon || isPassword || (showClearButton && value)) ? 0 : paddingHorizontal,
              fontSize,
              color: colors.text,
            },
            style
          ]}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor || colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={!showPassword}
          selectionColor={colors.primary}
          accessibilityLabel={label || placeholder}
          accessibilityHint={helperText}
          accessibilityState={getAccessibilityState()}
          {...props}
        />

        {showClearButton && value && value.length > 0 && (
          <TouchableOpacity 
            style={styles.rightIcon} 
            onPress={handleClear}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel="Clear text"
          >
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {isPassword && (
          <TouchableOpacity 
            style={styles.rightIcon} 
            onPress={togglePasswordVisibility}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff size={18} color={colors.textSecondary} />
            ) : (
              <Eye size={18} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <View style={styles.rightIcon}>
            {rightIcon}
          </View>
        )}
      </View>

      {(error || helperText) && (
        <Typography 
          variant="caption" 
          style={[
            styles.helperText,
            { color: error ? colors.error : colors.textSecondary }
          ]}
        >
          {error || helperText}
        </Typography>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  leftIcon: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  rightIcon: {
    paddingRight: 12,
    paddingLeft: 8,
  },
  helperText: {
    marginTop: 4,
  },
});

export default Input;
