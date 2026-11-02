// 出生信息页 - 录入生辰生成心象盘
import { View, Text, Picker } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useUserStore } from '@/stores';
import type { UserProfile, ProfileRelation } from '@/types';
import { RELATION_LABELS } from '@/types';
import {
  getTodayDateString,
  isFutureBirthDate,
  timeToBranch
} from '@/services/birthUtils';
import './birth.css';

const DEFAULT_BIRTH_DATE = '1998-01-01';

const BirthPage = () => {
  const router = useRouter();
  const isEditMode = router.params.edit === '1';

  const {
    addProfile,
    updateActiveProfile,
    profiles,
    userProfile,
    activeId,
    loadUserProfile,
    isLoading,
    error
  } = useUserStore();

  const [nickname, setNickname] = useState('');
  const [relation, setRelation] = useState<ProfileRelation>(profiles.length === 0 ? 'self' : 'family');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [unknownTime, setUnknownTime] = useState(false);
  const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown');
  const [birthPlace, setBirthPlace] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [formError, setFormError] = useState('');

  const today = getTodayDateString();

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  useEffect(() => {
    if (!isEditMode || !userProfile) return;
    setNickname(userProfile.nickname || '');
    setRelation(userProfile.relation || 'self');
    setBirthDate(userProfile.birthDate || '');
    setUnknownTime(userProfile.unknownTime ?? false);
    setBirthTime(userProfile.unknownTime ? '' : (userProfile.birthTime || ''));
    setGender((userProfile.gender as 'male' | 'female' | 'unknown') || 'unknown');
    setBirthPlace(userProfile.birthPlace || '');
    setPrivacyAccepted(userProfile.privacyAccepted ?? userProfile.privacyConsent ?? false);
  }, [isEditMode, userProfile]);

  const handleUnknownTimeChange = (checked: boolean) => {
    setUnknownTime(checked);
    if (checked) {
      setBirthTime('');
    }
  };

  const handleSubmit = async () => {
    if (!birthDate) {
      setFormError('请选择有效的出生日期');
      return;
    }
    if (isFutureBirthDate(birthDate, today)) {
      setFormError('出生日期不能晚于今天');
      return;
    }
    if (!unknownTime && !birthTime) {
      setFormError('请选择出生时间，或勾选「不知道时辰」');
      return;
    }
    if (!privacyAccepted) {
      setFormError('请先阅读并勾选隐私说明');
      return;
    }
    setFormError('');

    const now = new Date().toISOString();
    const timeBranch = unknownTime ? 'unknown' : timeToBranch(birthTime);
    const acceptedAt = now;

    const profile: UserProfile = {
      id: isEditMode && activeId ? activeId : `user_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      nickname: nickname.trim() || RELATION_LABELS[relation],
      relation,
      gender,
      birthDate,
      birthTime: unknownTime ? undefined : birthTime,
      timeBranch: unknownTime ? 'unknown' : timeBranch,
      unknownTime,
      birthPlace: birthPlace.trim() || undefined,
      calendarType: 'solar',
      privacyAccepted: true,
      privacyAcceptedAt: acceptedAt,
      privacyConsent: true,
      createdAt: isEditMode && userProfile?.createdAt ? userProfile.createdAt : now,
      updatedAt: now
    };

    try {
      if (isEditMode && activeId) {
        await updateActiveProfile(profile);
      } else {
        await addProfile(profile);
      }
      Taro.switchTab({ url: '/pages/fortune/today' });
    } catch (err) {
      console.error('排盘失败:', err);
      setFormError('排盘失败，请重试');
    }
  };

  const RELATIONS: ProfileRelation[] = ['self', 'family', 'friend', 'other'];

  const genderAccent = (g: typeof gender, active: boolean) => {
    if (!active) return 'neu-muted';
    return g === 'female' ? 'neu-pink' : g === 'unknown' ? 'neu-purple' : 'neu-cyan';
  };

  return (
    <View className="birth-container neu-page min-h-screen p-5">
      <View className="mb-6 mt-2">
        <Text className="block text-2xl font-bold neu-cyan tracking-[0.15em]">填写出生信息</Text>
        <Text className="block text-sm neu-muted mt-2 tracking-wide">
          {isEditMode
            ? '更新出生信息后，今日心象将重新生成'
            : profiles.length === 0
              ? '依你的生辰，生成专属心象'
              : '为这位本心生成专属心象'}
        </Text>
      </View>

      {!isEditMode && (
        <>
          <View className="neu-raised rounded-3xl p-5 mb-4">
            <Label className="neu-muted mb-2">称呼</Label>
            <View className="neu-pressed rounded-2xl px-4 py-3 mt-2">
              <Input
                className="w-full bg-transparent neu-fg"
                placeholderStyle="color: #aaa39597"
                placeholder="如：我自己 / 阿妈 / 阿明（留空则按关系）"
                value={nickname}
                onInput={(e) => setNickname(e.detail.value)}
                type="text"
              />
            </View>
          </View>

          <View className="neu-raised rounded-3xl p-5 mb-4">
            <Label className="neu-muted mb-2">关系</Label>
            <View className="grid grid-cols-4 gap-3 mt-2">
              {RELATIONS.map((r) => {
                const active = relation === r;
                return (
                  <View
                    key={r}
                    className={`rounded-2xl px-2 py-3 text-center ${active ? 'neu-pressed' : 'neu-raised-sm'}`}
                    onClick={() => setRelation(r)}
                  >
                    <Text className={active ? 'neu-cyan' : 'neu-muted'}>{RELATION_LABELS[r]}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </>
      )}

      <View className="neu-raised rounded-3xl p-5 mb-4">
        <Label className="neu-muted mb-2">出生日期</Label>
        <Text className="block text-xs neu-muted mb-2">日历类型：公历</Text>
        <Picker
          mode="date"
          value={birthDate || DEFAULT_BIRTH_DATE}
          start="1900-01-01"
          end={today}
          onChange={(e) => setBirthDate(e.detail.value)}
        >
          <View className="neu-pressed rounded-2xl px-4 py-3 mt-1 flex items-center justify-between">
            <Text className={birthDate ? 'neu-fg' : 'neu-muted'}>
              {birthDate || '请选择出生日期'}
            </Text>
            <Text className="neu-muted text-xs">▾</Text>
          </View>
        </Picker>
        <Text className="block text-xs neu-muted mt-2 opacity-80">
          当前先支持公历出生日期，后续将补充农历输入。
        </Text>
      </View>

      <View className="neu-raised rounded-3xl p-5 mb-4">
        <Label className="neu-muted mb-2">出生时间</Label>
        {!unknownTime && (
          <Picker
            mode="time"
            value={birthTime || '12:00'}
            onChange={(e) => setBirthTime(e.detail.value)}
          >
            <View className="neu-pressed rounded-2xl px-4 py-3 mt-2 flex items-center justify-between">
              <Text className={birthTime ? 'neu-fg' : 'neu-muted'}>
                {birthTime || '请选择出生时间'}
              </Text>
              <Text className="neu-muted text-xs">▾</Text>
            </View>
          </Picker>
        )}
        {unknownTime && (
          <View className="neu-pressed rounded-2xl px-4 py-3 mt-2">
            <Text className="neu-muted">未填写出生时辰</Text>
          </View>
        )}
        <View className="flex items-start gap-3 mt-3">
          <Checkbox
            checked={unknownTime}
            onCheckedChange={handleUnknownTimeChange}
          />
          <Text className="text-sm neu-fg flex-1">我不知道出生时间</Text>
        </View>
        {unknownTime && (
          <Text className="block text-xs neu-muted mt-2 leading-relaxed">
            心象盘会以出生日期为主生成，部分个性化内容会相对简化。
          </Text>
        )}
      </View>

      <View className="neu-raised rounded-3xl p-5 mb-4">
        <Label className="neu-muted mb-2">性别（可选）</Label>
        <View className="flex gap-3 mt-2">
          {([['male', '男'], ['female', '女'], ['unknown', '不详']] as const).map(([val, txt]) => {
            const active = gender === val;
            return (
              <View
                key={val}
                className={`flex-1 rounded-2xl px-4 py-3 text-center ${active ? 'neu-pressed' : 'neu-raised-sm'}`}
                onClick={() => setGender(val)}
              >
                <Text className={genderAccent(val, active)}>{txt}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View className="neu-raised rounded-3xl p-5 mb-4">
        <Label className="neu-muted mb-2">出生地（可选）</Label>
        <View className="neu-pressed rounded-2xl px-4 py-3 mt-2">
          <Input
            className="w-full bg-transparent neu-fg"
            placeholderStyle="color: #aaa39597"
            placeholder="如：北京"
            value={birthPlace}
            onInput={(e) => setBirthPlace(e.detail.value)}
          />
        </View>
      </View>

      <View className="neu-pressed-sm rounded-2xl p-4 mb-4">
        <View className="flex items-start gap-3">
          <Checkbox
            checked={privacyAccepted}
            onCheckedChange={(checked) => setPrivacyAccepted(checked)}
          />
          <View className="flex-1">
            <Text className="block text-sm neu-fg leading-relaxed">
              我已了解并同意：基础信息将用于生成个人心象内容；使用 AI 问心时，系统会上传必要的心象摘要与问题内容，用于生成回应。内容仅作传统文化与自我观察参考。
            </Text>
          </View>
        </View>
      </View>

      {(formError || error) && (
        <View className="neu-pressed-sm rounded-2xl p-4 mb-4">
          <Text className="block text-sm neu-pink">{formError || error}</Text>
        </View>
      )}

      <View
        className={`neu-raised neu-press w-full h-14 rounded-2xl flex items-center justify-center mt-4 ${isLoading ? 'opacity-60' : ''}`}
        onClick={() => { if (!isLoading) handleSubmit(); }}
      >
        <Text className="block text-lg font-medium neu-cyan tracking-[0.2em]">
          {isLoading ? '正在生成…' : isEditMode ? '保存并更新心象' : '生成我的心象'}
        </Text>
      </View>

      <View className="mt-6 text-center">
        <Text className="block text-xs neu-muted">
          心象依出生信息生成，仅作自我观察与情绪陪伴
        </Text>
      </View>
    </View>
  );
};

export default BirthPage;
