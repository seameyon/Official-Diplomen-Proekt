export const en = {
  auth: {
    registerSuccess: 'Registration successful. Please check your email to verify your account.',
    loginSuccess: 'Login successful',
    emailVerified: 'Email verified successfully',
    verificationSent: 'Verification email sent',
    passwordResetSent: 'If an account exists with this email, you will receive a password reset link',
    passwordResetSuccess: 'Password reset successful. You can now login with your new password.',
    invalidCredentials: 'Invalid email or password',
    notAuthorized: 'Not authorized',
    tokenExpired: 'Token expired',
    emailNotVerified: 'Please verify your email first',
  },
  user: {
    notFound: 'User not found',
    profileUpdated: 'Profile updated successfully',
    settingsUpdated: 'Settings updated successfully',
    avatarUpdated: 'Avatar updated successfully',
    accountDeleted: 'Account deleted successfully',
    usernameTaken: 'Username already taken',
    onboardingRequired: 'Please complete your health profile first',
  },
  recipe: {
    created: 'Recipe created successfully',
    updated: 'Recipe updated successfully',
    deleted: 'Recipe deleted successfully',
    notFound: 'Recipe not found',
    notAuthorized: 'Not authorized to modify this recipe',
  },
  favorite: {
    added: 'Recipe added to favorites',
    removed: 'Recipe removed from favorites',
    alreadyFavorited: 'Recipe already in favorites',
    notFound: 'Favorite not found',
  },
  mealPlan: {
    generated: 'Meal plan generated successfully',
    regenerated: 'Meal plan regenerated successfully',
    notFound: 'No meal plan found for current week',
    mealReplaced: 'Meal replaced successfully',
    noAlternatives: 'No alternative recipes found',
  },
  validation: {
    required: '{field} is required',
    invalid: 'Invalid {field}',
    minLength: '{field} must be at least {min} characters',
    maxLength: '{field} must be at most {max} characters',
  },
  errors: {
    serverError: 'Internal server error',
    notFound: 'Resource not found',
    tooManyRequests: 'Too many requests, please try again later',
  },
};

export default en;
