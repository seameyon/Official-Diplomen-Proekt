import { Request, Response } from 'express';
import { User } from '../models/User.model.js';


export const updateHealthProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'Не сте влезли в профила си' });
      return;
    }

    const profileData = req.body;
    console.log('Received health profile data:', JSON.stringify(profileData, null, 2));

   
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          healthProfile: profileData,
          hasCompletedOnboarding: true 
        }
      },
      { new: true, upsert: false }
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'Потребителят не е намерен' });
      return;
    }

    console.log('User updated successfully:', user._id);

    res.json({
      success: true,
      message: 'Профилът е запазен успешно!',
      data: {
        healthProfile: user.healthProfile,
        metrics: {
          bmi: 22,
          bmiCategory: 'Нормално',
        },
      },
    });
  } catch (error: any) {
    console.error('Error updating health profile:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Грешка при запазване' 
    });
  }
};


export const getHealthProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        healthProfile: user?.healthProfile || null,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const updates = req.body;

    const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true });

    res.json({
      success: true,
      message: 'Настройките са обновени',
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updateAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { avatar } = req.body;

    await User.findByIdAndUpdate(userId, { avatar });

    res.json({ success: true, message: 'Аватарът е обновен' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getPublicProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('username avatar bio createdAt');

    if (!user) {
      res.status(404).json({ success: false, message: 'Потребителят не е намерен' });
      return;
    }

    res.json({ success: true, data: { user } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    await User.findByIdAndDelete(userId);
    res.json({ success: true, message: 'Акаунтът е изтрит' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Моля, въведете текущата и новата парола' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ success: false, message: 'Новата парола трябва да е поне 8 символа' });
      return;
    }

    
    const user = await User.findById(userId).select('+password');

    if (!user) {
      res.status(404).json({ success: false, message: 'Потребителят не е намерен' });
      return;
    }

   
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Текущата парола е грешна' });
      return;
    }

  
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Паролата е променена успешно' });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: error.message || 'Грешка при смяна на паролата' });
  }
};

export default {
  updateHealthProfile,
  getHealthProfile,
  updateSettings,
  updateAvatar,
  getPublicProfile,
  deleteAccount,
  changePassword,
};
