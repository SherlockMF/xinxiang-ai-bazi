// 出生信息页 - 用户输入出生信息生成八字档案
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useUserStore } from '@/stores';
import type { UserProfile } from '@/types';
import './birth.css';

const BirthPage = () => {
  const { setUserProfile, generateBazi, isLoading, error } = useUserStore();
  
  // 表单状态
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown');
  const [birthPlace, setBirthPlace] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  
  // 表单校验错误
  const [formError, setFormError] = useState('');

  const handleGenderChange = (value: 'male' | 'female' | 'unknown') => {
    setGender(value);
  };

  const handleSubmit = async () => {
    // 校验必填项
    if (!birthDate) {
      setFormError('请选择出生日期');
      return;
    }
    if (!birthTime) {
      setFormError('请选择出生时间');
      return;
    }
    if (!privacyConsent) {
      setFormError('请同意隐私与娱乐声明');
      return;
    }
    setFormError('');

    // 创建用户档案
    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const profile: UserProfile = {
      id: userId,
      gender,
      birthDate,
      birthTime,
      birthPlace,
      calendarType: 'solar',
      privacyConsent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // 保存用户档案
      setUserProfile(profile);
      
      // 生成八字档案
      await generateBazi(profile);
      
      // 跳转到八字档案页
      Taro.redirectTo({ url: '/pages/profile/bazi' });
    } catch (err) {
      console.error('生成八字失败:', err);
      setFormError('生成八字档案失败，请重试');
    }
  };

  return (
    <View className="birth-container min-h-screen bg-slate-900 p-4">
      {/* 顶部标题 */}
      <View className="mb-6">
        <Text className="block text-2xl font-bold text-cyan-400">输入出生信息</Text>
        <Text className="block text-sm text-slate-400 mt-2">生成你的专属灵频档案</Text>
      </View>

      {/* 出生日期 */}
      <Card className="mb-4 bg-gray-800 bg-opacity-50 border-cyan-500 border-opacity-20">
        <CardContent className="p-4">
          <Label className="text-slate-300 mb-2">出生日期 *</Label>
          <View className="bg-gray-900 bg-opacity-50 rounded-xl px-4 py-3 mt-2">
            {/* MVP 版本：使用输入框，后续可改为 Picker */}
            <Input
              className="w-full bg-transparent text-cyan-400 placeholder-slate-500"
              placeholderStyle="color: #64748b"
              placeholder="格式：1990-01-15"
              value={birthDate}
              onInput={(e) => setBirthDate(e.detail.value)}
              type="text"
            />
          </View>
        </CardContent>
      </Card>

      {/* 出生时间 */}
      <Card className="mb-4 bg-gray-800 bg-opacity-50 border-cyan-500 border-opacity-20">
        <CardContent className="p-4">
          <Label className="text-slate-300 mb-2">出生时间 *</Label>
          <View className="bg-gray-900 bg-opacity-50 rounded-xl px-4 py-3 mt-2">
            <Input
              className="w-full bg-transparent text-cyan-400 placeholder-slate-500"
              placeholderStyle="color: #64748b"
              placeholder="格式：14:30"
              value={birthTime}
              onInput={(e) => setBirthTime(e.detail.value)}
              type="text"
            />
          </View>
          <Text className="block text-xs text-slate-500 mt-2">
            时间用于计算时柱，不知道可以填写中午12:00
          </Text>
        </CardContent>
      </Card>

      {/* 性别（可选） */}
      <Card className="mb-4 bg-gray-800 bg-opacity-50 border-cyan-500 border-opacity-20">
        <CardContent className="p-4">
          <Label className="text-slate-300 mb-2">性别（可选）</Label>
          <View className="flex gap-4 mt-2">
            <View 
              className={`flex-1 rounded-xl px-4 py-3 text-center ${gender === 'male' ? 'bg-cyan-500 bg-opacity-30 border border-cyan-400' : 'bg-gray-900 bg-opacity-50'}`}
              onClick={() => handleGenderChange('male')}
            >
              <Text className={gender === 'male' ? 'text-cyan-400' : 'text-slate-400'}>男</Text>
            </View>
            <View 
              className={`flex-1 rounded-xl px-4 py-3 text-center ${gender === 'female' ? 'bg-pink-500 bg-opacity-30 border border-pink-400' : 'bg-gray-900 bg-opacity-50'}`}
              onClick={() => handleGenderChange('female')}
            >
              <Text className={gender === 'female' ? 'text-pink-400' : 'text-slate-400'}>女</Text>
            </View>
            <View 
              className={`flex-1 rounded-xl px-4 py-3 text-center ${gender === 'unknown' ? 'bg-purple-500 bg-opacity-30 border border-purple-400' : 'bg-gray-900 bg-opacity-50'}`}
              onClick={() => handleGenderChange('unknown')}
            >
              <Text className={gender === 'unknown' ? 'text-purple-400' : 'text-slate-400'}>不详</Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* 出生地（可选） */}
      <Card className="mb-4 bg-gray-800 bg-opacity-50 border-cyan-500 border-opacity-20">
        <CardContent className="p-4">
          <Label className="text-slate-300 mb-2">出生地（可选）</Label>
          <View className="bg-gray-900 bg-opacity-50 rounded-xl px-4 py-3 mt-2">
            <Input
              className="w-full bg-transparent text-cyan-400 placeholder-slate-500"
              placeholderStyle="color: #64748b"
              placeholder="如：北京"
              value={birthPlace}
              onInput={(e) => setBirthPlace(e.detail.value)}
            />
          </View>
        </CardContent>
      </Card>

      {/* 历法类型说明 */}
      <View className="mb-4 p-4 rounded-xl bg-gray-800 bg-opacity-30">
        <Text className="block text-sm text-slate-400">
          历法类型：公历（默认）
        </Text>
        <Text className="block text-xs text-slate-500 mt-1">
          MVP版本暂只支持公历，农历将在后续版本上线
        </Text>
      </View>

      {/* 隐私声明 */}
      <View className="mb-4 p-4 rounded-xl bg-gray-800 bg-opacity-30">
        <View className="flex items-start gap-3">
          <Checkbox
            checked={privacyConsent}
            onCheckedChange={(checked) => setPrivacyConsent(checked)}
          />
          <View className="flex-1">
            <Text className="block text-sm text-slate-300">
              我已阅读并同意隐私与娱乐声明
            </Text>
            <Text className="block text-xs text-slate-500 mt-1">
              本产品内容仅供娱乐与情绪陪伴，不构成任何现实决策建议。出生信息与八字档案默认仅存储在本地设备。使用「AI 追问」功能时，问题、八字摘要与今日运势会发送至服务端用于生成回复。
            </Text>
          </View>
        </View>
      </View>

      {/* 错误提示 */}
      {(formError || error) && (
        <View className="mb-4 p-4 rounded-xl bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30">
          <Text className="block text-sm text-red-400">{formError || error}</Text>
        </View>
      )}

      {/* 提交按钮 */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl border-0 mt-4"
      >
        <Text className="block text-lg font-medium text-white">
          {isLoading ? '正在生成...' : '生成我的灵频档案'}
        </Text>
      </Button>

      {/* 底部说明 */}
      <View className="mt-6 text-center">
        <Text className="block text-xs text-slate-500">
          八字档案基于传统算法生成，仅供娱乐参考
        </Text>
      </View>
    </View>
  );
};

export default BirthPage;