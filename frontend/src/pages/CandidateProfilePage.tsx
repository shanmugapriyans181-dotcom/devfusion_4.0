import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { candidateApi } from '../services/candidate.api';
import { useAuth } from '../contexts/AuthContext';
import {
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Globe,
  FileText,
  Upload,
  User as UserIcon,
  CheckCircle,
  Briefcase
} from 'lucide-react';

export const CandidateProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  
  // Dynamic fields
  const [isCollegeStudent, setIsCollegeStudent] = useState(false);
  const [educationStr, setEducationStr] = useState('');
  const [courseBranch, setCourseBranch] = useState('');
  const [joinYear, setJoinYear] = useState('');
  const [passYear, setPassYear] = useState('');
  
  const [currentRole, setCurrentRole] = useState('');
  const [totalExperience, setTotalExperience] = useState<number>(0);
  const [resumeName, setResumeName] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await candidateApi.getProfile();
      const p = res.data;
      setProfile(p);
      if (p) {
        setName(p.user?.name || user?.name || '');
        const fetchedPhone = p.phone || p.user?.phone || '';
        setPhone(fetchedPhone.replace(/^\+91\s*/, '').trim());
        const loc = p.location || p.user?.location || '';
        if (loc) {
          const parts = loc.split(',');
          setState(parts[0]?.trim() || '');
          setCountry(parts[1]?.trim() || '');
        } else {
          setState('');
          setCountry('');
        }
        setGithub(p.github || '');
        setLinkedin(p.linkedin || '');
        setPortfolio(p.portfolio || '');
        setSkillsStr(p.skills ? p.skills.join(', ') : '');
        
        const edu = p.education?.[0] || {};
        setEducationStr(edu.institution || '');
        setCourseBranch(edu.course || '');
        setJoinYear(edu.joinYear || '');
        setPassYear(edu.passYear || '');
        setIsCollegeStudent(!!edu.isCollegeStudent);

        setCurrentRole(p.experience?.[0]?.role || '');
        setTotalExperience(p.totalExperience || 0);

        if (p.resumes && p.resumes.length > 0) {
          setResumeName(p.resumes[0].fileName);
        }
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Only PDF files (.pdf) are allowed!');
      return;
    }

    setResumeName(file.name);
    try {
      await candidateApi.updateProfile({ resumeName: file.name });
      setSuccessMsg(`PDF Resume "${file.name}" uploaded and saved successfully!`);
      await fetchProfile();
    } catch (err) {
      console.error('Failed to save resume:', err);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed for profile photos!');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await candidateApi.updateProfile({ avatar: base64String });
        setSuccessMsg('Profile photo updated successfully!');
        await fetchProfile();
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to upload photo:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg('');
    try {
      const skillsArray = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);
      const locStr = [state, country].filter(Boolean).join(', ');
      
      await candidateApi.updateProfile({
        name,
        bio,
        phone: phone ? `+91 ${phone.trim()}` : '',
        location: locStr,
        github,
        linkedin,
        portfolio,
        skills: skillsArray,
        education: (isCollegeStudent && educationStr) ? [{ 
          institution: educationStr,
          isCollegeStudent,
          course: courseBranch,
          joinYear,
          passYear
        }] : [],
        experience: currentRole ? [{ role: currentRole }] : [],
        totalExperience: isCollegeStudent ? 0 : totalExperience,
      });
      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
      await fetchProfile();
    } catch (e) {
      console.error('Failed to save profile:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = profile?.user?.name || user?.name || 'Candidate';
  const displayEmail = profile?.user?.email || user?.email || '';
  const displayPhone = profile?.phone || profile?.user?.phone || 'No phone number provided';
  const displayLocation = profile?.location || profile?.user?.location || 'No location provided';
  const displayBio = profile?.bio || 'No professional bio added yet. Click "Edit Profile" to add your summary.';
  const displaySkills: string[] = profile?.skills && profile.skills.length > 0 ? profile.skills : [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidate Profile & Resume</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your personal bio, contact info, skills, and resume.</p>
        </div>
        <Button variant={isEditing ? 'outline' : 'primary'} onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel Editing' : 'Edit Profile'}
        </Button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Info Side Card */}
        <Card className="glass-card p-6 space-y-6 md:col-span-1 text-center">
          <div className="relative inline-block mx-auto group">
            <img
              src={profile?.user?.avatar || user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-brand-500/20 object-cover mx-auto"
            />
            <label className="absolute inset-0 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-200">
              <Upload className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Update</span>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
          <div>
            <h3 className="text-xl font-bold">{displayName}</h3>
            <div className="text-xs text-brand-500 font-semibold mt-1 flex items-center justify-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Candidate</span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-left text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{displayEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{displayPhone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{displayLocation}</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-slate-400">
            {profile?.github ? (
              <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            ) : null}
            {profile?.linkedin ? (
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            ) : null}
            {profile?.portfolio ? (
              <a href={profile.portfolio} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </a>
            ) : null}
          </div>
        </Card>

        {/* Profile Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Resume Upload Box */}
          <Card className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-500" />
              <span>Resume Document</span>
            </h3>

            <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">
                    {resumeName ? resumeName : 'No resume uploaded yet'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {resumeName ? 'Uploaded PDF Document' : 'PDF files only (.pdf)'}
                  </div>
                </div>
              </div>
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-xs font-semibold text-white transition shadow-sm">
                  <Upload className="w-4 h-4" />
                  <span>{resumeName ? 'Replace PDF Resume' : 'Upload PDF Resume'}</span>
                  <input type="file" accept="application/pdf,.pdf" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          </Card>

          {/* Overview / Edit Form */}
          <Card className="glass-card p-6 space-y-6">
            <h3 className="text-lg font-bold">Professional Overview</h3>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/50 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">Professional Bio</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a brief overview of your background, experience, and career goals..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/50 text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">Phone</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 font-medium text-slate-500 text-sm pointer-events-none">+91</div>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/^\+91\s*/, ''))}
                        placeholder="9876543210"
                        className="w-full pl-10 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/50 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Tamil Nadu"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="India"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/50 text-sm"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={isCollegeStudent}
                      onChange={(e) => setIsCollegeStudent(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">I am currently a College Student</span>
                  </label>
                </div>

                {isCollegeStudent ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">College / University</label>
                      <input
                        type="text"
                        value={educationStr}
                        onChange={(e) => setEducationStr(e.target.value)}
                        placeholder="e.g. Anna University"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">Course / Branch</label>
                      <input
                        type="text"
                        value={courseBranch}
                        onChange={(e) => setCourseBranch(e.target.value)}
                        placeholder="e.g. B.Tech IT"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">Joining Year</label>
                      <input
                        type="text"
                        value={joinYear}
                        onChange={(e) => setJoinYear(e.target.value)}
                        placeholder="e.g. 2021"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">Passed Out Year</label>
                      <input
                        type="text"
                        value={passYear}
                        onChange={(e) => setPassYear(e.target.value)}
                        placeholder="e.g. 2025"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/50 text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">Current Role / Job Title</label>
                      <input
                        type="text"
                        value={currentRole}
                        onChange={(e) => setCurrentRole(e.target.value)}
                        placeholder="e.g. Software Engineer"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/50 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">Total Experience (Years)</label>
                      <input
                        type="number"
                        value={totalExperience}
                        onChange={(e) => setTotalExperience(Number(e.target.value))}
                        placeholder="0"
                        min="0"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/50 text-sm"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">Skills (Comma Separated)</label>
                  <input
                    type="text"
                    value={skillsStr}
                    onChange={(e) => setSkillsStr(e.target.value)}
                    placeholder="React, Node.js, TypeScript, SQL..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/50 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">GitHub Link</label>
                    <input
                      type="url"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">LinkedIn Link</label>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">Portfolio Link</label>
                    <input
                      type="url"
                      value={portfolio}
                      onChange={(e) => setPortfolio(e.target.value)}
                      placeholder="https://yourportfolio.com"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900/50 text-sm"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Button type="submit" variant="primary" isLoading={isLoading}>
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">About</span>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {displayBio}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Education</span>
                    {profile?.education?.[0]?.isCollegeStudent ? (
                      <div className="text-sm text-slate-300">
                        <div className="font-semibold">{profile.education[0].institution || 'College not added'}</div>
                        <div className="text-slate-400">{profile.education[0].course || 'Course not added'}</div>
                        {(profile.education[0].joinYear || profile.education[0].passYear) && (
                          <div className="text-slate-400 text-xs mt-0.5">{profile.education[0].joinYear || 'N/A'} - {profile.education[0].passYear || 'N/A'}</div>
                        )}
                        <Badge variant="primary" className="mt-1">Student</Badge>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-300 italic">
                        Not required for working professionals
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Experience</span>
                    <p className="text-sm text-slate-300">
                      {profile?.education?.[0]?.isCollegeStudent 
                        ? 'Fresher / College Student'
                        : profile?.experience?.[0]?.role ? `${profile.experience[0].role} (${profile.totalExperience || 0} years)` : 'Not added'}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">Verified Skills</span>
                  <div className="flex flex-wrap gap-2">
                    {displaySkills.length > 0 ? (
                      displaySkills.map((skill: string) => (
                        <Badge key={skill} variant="primary">{skill}</Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No skills added yet. Click "Edit Profile" to add skills.</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
