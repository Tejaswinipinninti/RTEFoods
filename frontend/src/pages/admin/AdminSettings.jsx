import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Loader2,
  Save,
  Globe,
  Search,
  Share2,
  Mail,
  CreditCard,
  Truck,
  Receipt,
  Bell,
  FileText,
  Settings,
  Wrench,
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const tabs = [
  { key: 'general', label: 'General', icon: Globe },
  { key: 'seo', label: 'SEO', icon: Search },
  { key: 'social', label: 'Social', icon: Share2 },
  { key: 'email', label: 'Email SMTP', icon: Mail },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'shipping', label: 'Shipping', icon: Truck },
  { key: 'tax', label: 'Tax', icon: Receipt },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'footer', label: 'Footer', icon: FileText },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench },
];

const Input = ({ label, error, ...props }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
    <input {...props} className={`w-full px-4 py-2.5 bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500`} />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

const Textarea = ({ label, error, ...props }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>}
    <textarea {...props} className={`w-full px-4 py-2.5 bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none`} />
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <div className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-indigo-500' : 'bg-white/10'}`}>
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </div>
    <span className="text-sm text-gray-300">{label}</span>
  </label>
);

const SettingsCard = ({ title, children, onSave, saving }) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
    <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
    <div className="space-y-4">{children}</div>
    <div className="flex justify-end mt-6 pt-4 border-t border-white/10">
      <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Changes
      </button>
    </div>
  </div>
);

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminService.getSettings();
      const d = res.data;
      const data = d?.data || d;
      setSettings(data?.settings || data || {});
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const updateField = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateNested = (parent, key, value) => {
    setSettings((prev) => ({ ...prev, [parent]: { ...prev[parent], [key]: value } }));
  };

  const handleSave = async (section) => {
    try {
      setSaving(true);
      await adminService.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Configure your store settings</p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        {activeTab === 'general' && (
          <SettingsCard title="General Settings" onSave={() => handleSave('general')} saving={saving}>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Site Name" value={settings.siteName || ''} onChange={(e) => updateField('siteName', e.target.value)} placeholder="Your Store Name" />
              <Input label="Contact Email" type="email" value={settings.contactEmail || ''} onChange={(e) => updateField('contactEmail', e.target.value)} placeholder="email@example.com" />
            </div>
            <Textarea label="Site Description" rows={3} value={settings.siteDescription || ''} onChange={(e) => updateField('siteDescription', e.target.value)} placeholder="About your store" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Phone" value={settings.phone || ''} onChange={(e) => updateField('phone', e.target.value)} placeholder="+91 98765 43210" />
              <Input label="Currency" value={settings.currency || 'INR'} onChange={(e) => updateField('currency', e.target.value)} placeholder="INR" />
            </div>
            <Textarea label="Address" rows={2} value={settings.address || ''} onChange={(e) => updateField('address', e.target.value)} placeholder="Store address" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Logo</label>
                <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) updateField('logo', e.target.files[0]); }}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:text-white file:cursor-pointer" />
                {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="mt-2 h-12 rounded-lg" />}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Favicon</label>
                <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) updateField('favicon', e.target.files[0]); }}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:text-white file:cursor-pointer" />
              </div>
            </div>
          </SettingsCard>
        )}

        {activeTab === 'seo' && (
          <SettingsCard title="SEO Settings" onSave={() => handleSave('seo')} saving={saving}>
            <Input label="Meta Title" value={settings.seo?.metaTitle || ''} onChange={(e) => updateNested('seo', 'metaTitle', e.target.value)} placeholder="SEO meta title" />
            <Textarea label="Meta Description" rows={3} value={settings.seo?.metaDescription || ''} onChange={(e) => updateNested('seo', 'metaDescription', e.target.value)} placeholder="SEO meta description" />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">OG Image</label>
              <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) updateNested('seo', 'ogImage', e.target.files[0]); }}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:text-white file:cursor-pointer" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Google Analytics ID" value={settings.seo?.googleAnalyticsId || ''} onChange={(e) => updateNested('seo', 'googleAnalyticsId', e.target.value)} placeholder="G-XXXXXXXXXX" />
              <Input label="Facebook Pixel ID" value={settings.seo?.facebookPixelId || ''} onChange={(e) => updateNested('seo', 'facebookPixelId', e.target.value)} placeholder="1234567890" />
            </div>
          </SettingsCard>
        )}

        {activeTab === 'social' && (
          <SettingsCard title="Social Media Links" onSave={() => handleSave('social')} saving={saving}>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Facebook" value={settings.social?.facebook || ''} onChange={(e) => updateNested('social', 'facebook', e.target.value)} placeholder="https://facebook.com/..." />
              <Input label="Instagram" value={settings.social?.instagram || ''} onChange={(e) => updateNested('social', 'instagram', e.target.value)} placeholder="https://instagram.com/..." />
              <Input label="Twitter" value={settings.social?.twitter || ''} onChange={(e) => updateNested('social', 'twitter', e.target.value)} placeholder="https://twitter.com/..." />
              <Input label="YouTube" value={settings.social?.youtube || ''} onChange={(e) => updateNested('social', 'youtube', e.target.value)} placeholder="https://youtube.com/..." />
              <Input label="WhatsApp" value={settings.social?.whatsapp || ''} onChange={(e) => updateNested('social', 'whatsapp', e.target.value)} placeholder="+91 98765 43210" />
              <Input label="LinkedIn" value={settings.social?.linkedin || ''} onChange={(e) => updateNested('social', 'linkedin', e.target.value)} placeholder="https://linkedin.com/..." />
            </div>
          </SettingsCard>
        )}

        {activeTab === 'email' && (
          <SettingsCard title="Email SMTP Settings" onSave={() => handleSave('email')} saving={saving}>
            <div className="grid grid-cols-2 gap-4">
              <Input label="SMTP Host" value={settings.email?.host || ''} onChange={(e) => updateNested('email', 'host', e.target.value)} placeholder="smtp.gmail.com" />
              <Input label="SMTP Port" type="number" value={settings.email?.port || ''} onChange={(e) => updateNested('email', 'port', e.target.value)} placeholder="587" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Username" value={settings.email?.user || ''} onChange={(e) => updateNested('email', 'user', e.target.value)} placeholder="your@email.com" />
              <Input label="Password" type="password" value={settings.email?.pass || ''} onChange={(e) => updateNested('email', 'pass', e.target.value)} placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="From Email" value={settings.email?.fromEmail || ''} onChange={(e) => updateNested('email', 'fromEmail', e.target.value)} placeholder="noreply@yourstore.com" />
              <Input label="From Name" value={settings.email?.fromName || ''} onChange={(e) => updateNested('email', 'fromName', e.target.value)} placeholder="Your Store" />
            </div>
          </SettingsCard>
        )}

        {activeTab === 'payment' && (
          <SettingsCard title="Payment Settings" onSave={() => handleSave('payment')} saving={saving}>
            <div className="space-y-4">
              <Toggle label="Enable Razorpay" checked={settings.payment?.razorpay?.enabled || false} onChange={(v) => updateNested('payment', 'razorpay', { ...settings.payment?.razorpay, enabled: v })} />
              {settings.payment?.razorpay?.enabled && (
                <div className="grid grid-cols-2 gap-4 ml-8">
                  <Input label="Razorpay Key ID" value={settings.payment?.razorpay?.keyId || ''} onChange={(e) => updateNested('payment', 'razorpay', { ...settings.payment?.razorpay, keyId: e.target.value })} placeholder="rzp_live_..." />
                  <Input label="Razorpay Key Secret" type="password" value={settings.payment?.razorpay?.keySecret || ''} onChange={(e) => updateNested('payment', 'razorpay', { ...settings.payment?.razorpay, keySecret: e.target.value })} placeholder="••••••••" />
                </div>
              )}
            </div>
            <div className="space-y-4">
              <Toggle label="Enable Stripe" checked={settings.payment?.stripe?.enabled || false} onChange={(v) => updateNested('payment', 'stripe', { ...settings.payment?.stripe, enabled: v })} />
              {settings.payment?.stripe?.enabled && (
                <div className="grid grid-cols-2 gap-4 ml-8">
                  <Input label="Publishable Key" value={settings.payment?.stripe?.publishableKey || ''} onChange={(e) => updateNested('payment', 'stripe', { ...settings.payment?.stripe, publishableKey: e.target.value })} placeholder="pk_live_..." />
                  <Input label="Secret Key" type="password" value={settings.payment?.stripe?.secretKey || ''} onChange={(e) => updateNested('payment', 'stripe', { ...settings.payment?.stripe, secretKey: e.target.value })} placeholder="••••••••" />
                </div>
              )}
            </div>
            <div className="space-y-4">
              <Toggle label="Enable COD" checked={settings.payment?.cod?.enabled || false} onChange={(v) => updateNested('payment', 'cod', { ...settings.payment?.cod, enabled: v })} />
              {settings.payment?.cod?.enabled && (
                <div className="grid grid-cols-2 gap-4 ml-8">
                  <Input label="COD Min Amount" type="number" value={settings.payment?.cod?.minAmount || ''} onChange={(e) => updateNested('payment', 'cod', { ...settings.payment?.cod, minAmount: e.target.value })} />
                  <Input label="COD Max Amount" type="number" value={settings.payment?.cod?.maxAmount || ''} onChange={(e) => updateNested('payment', 'cod', { ...settings.payment?.cod, maxAmount: e.target.value })} />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Toggle label="Enable Wallet" checked={settings.payment?.wallet?.enabled || false} onChange={(v) => updateNested('payment', 'wallet', { ...settings.payment?.wallet, enabled: v })} />
              <Toggle label="Enable UPI" checked={settings.payment?.upi?.enabled || false} onChange={(v) => updateNested('payment', 'upi', { ...settings.payment?.upi, enabled: v })} />
            </div>
          </SettingsCard>
        )}

        {activeTab === 'shipping' && (
          <SettingsCard title="Shipping Settings" onSave={() => handleSave('shipping')} saving={saving}>
            <Toggle label="Free Shipping" checked={settings.shipping?.freeShipping || false} onChange={(v) => updateNested('shipping', 'freeShipping', v)} />
            {settings.shipping?.freeShipping && (
              <Input label="Free Shipping Minimum Amount (₹)" type="number" value={settings.shipping?.freeShippingMinAmount || ''} onChange={(e) => updateNested('shipping', 'freeShippingMinAmount', e.target.value)} />
            )}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Default Shipping Charge (₹)" type="number" value={settings.shipping?.defaultCharge || ''} onChange={(e) => updateNested('shipping', 'defaultCharge', e.target.value)} placeholder="49" />
              <Input label="Estimated Delivery Days" type="number" value={settings.shipping?.estimatedDays || ''} onChange={(e) => updateNested('shipping', 'estimatedDays', e.target.value)} placeholder="3-5" />
            </div>
          </SettingsCard>
        )}

        {activeTab === 'tax' && (
          <SettingsCard title="Tax Settings" onSave={() => handleSave('tax')} saving={saving}>
            <Toggle label="Enable GST" checked={settings.tax?.gstEnabled || false} onChange={(v) => updateNested('tax', 'gstEnabled', v)} />
            {settings.tax?.gstEnabled && (
              <div className="grid grid-cols-4 gap-4 ml-8">
                <Input label="GST %" type="number" step="0.01" value={settings.tax?.gstPercent || ''} onChange={(e) => updateNested('tax', 'gstPercent', e.target.value)} placeholder="18" />
                <Input label="CGST %" type="number" step="0.01" value={settings.tax?.cgst || ''} onChange={(e) => updateNested('tax', 'cgst', e.target.value)} placeholder="9" />
                <Input label="SGST %" type="number" step="0.01" value={settings.tax?.sgst || ''} onChange={(e) => updateNested('tax', 'sgst', e.target.value)} placeholder="9" />
                <Input label="IGST %" type="number" step="0.01" value={settings.tax?.igst || ''} onChange={(e) => updateNested('tax', 'igst', e.target.value)} placeholder="18" />
              </div>
            )}
          </SettingsCard>
        )}

        {activeTab === 'notifications' && (
          <SettingsCard title="Notification Settings" onSave={() => handleSave('notifications')} saving={saving}>
            <Toggle label="Email Notifications" checked={settings.notifications?.email || false} onChange={(v) => updateNested('notifications', 'email', v)} />
            <Toggle label="SMS Notifications" checked={settings.notifications?.sms || false} onChange={(v) => updateNested('notifications', 'sms', v)} />
            <Toggle label="Push Notifications" checked={settings.notifications?.push || false} onChange={(v) => updateNested('notifications', 'push', v)} />
          </SettingsCard>
        )}

        {activeTab === 'footer' && (
          <SettingsCard title="Footer Settings" onSave={() => handleSave('footer')} saving={saving}>
            <Textarea label="About Text" rows={4} value={settings.footer?.about || ''} onChange={(e) => updateNested('footer', 'about', e.target.value)} placeholder="About your store..." />
            <Textarea label="Quick Links (one per line: Label | URL)" rows={5} value={settings.footer?.quickLinks || ''} onChange={(e) => updateNested('footer', 'quickLinks', e.target.value)} placeholder="Home | /\nAbout | /about\nContact | /contact" />
            <Textarea label="Policy Links (one per line: Label | URL)" rows={5} value={settings.footer?.policyLinks || ''} onChange={(e) => updateNested('footer', 'policyLinks', e.target.value)} placeholder="Privacy Policy | /privacy\nTerms | /terms\nRefund Policy | /refund" />
          </SettingsCard>
        )}

        {activeTab === 'maintenance' && (
          <SettingsCard title="Maintenance Mode" onSave={() => handleSave('maintenance')} saving={saving}>
            <Toggle label="Enable Maintenance Mode" checked={settings.maintenance?.enabled || false} onChange={(v) => updateNested('maintenance', 'enabled', v)} />
            {settings.maintenance?.enabled && (
              <Textarea label="Maintenance Message" rows={3} value={settings.maintenance?.message || ''} onChange={(e) => updateNested('maintenance', 'message', e.target.value)} placeholder="We are currently performing maintenance. Please check back later." />
            )}
          </SettingsCard>
        )}
      </motion.div>
    </motion.div>
  );
}
