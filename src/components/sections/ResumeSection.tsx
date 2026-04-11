import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Eye, Phone, Mail, MapPin, Globe, Briefcase, GraduationCap, Wrench, X, Printer, QrCode } from 'lucide-react';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { Button } from '@/components/ui/button';
import { supabase, ResumeData } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';

const SITE_URL = 'https://mdomarfaruque.lovable.app';

export function ResumeSection() {
  const [resumeData, setResumeData] = useState<ResumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchResumeData().finally(() => setLoading(false));
  }, []);




  const fetchResumeData = async () => {
    try {
      const { data } = await supabase
        .from('resume_data')
        .select('*')
        .order('display_order');
      if (data) setResumeData(data);
    } catch (e) {
      console.log('Error fetching resume data:', e);
    }
  };

  const getByCategory = (cat: string) => resumeData.filter((d) => d.category === cat);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Resume - MD Omar Faruque</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #222; }
        h1 { font-size: 28px; margin-bottom: 4px; }
        h2 { font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 4px; margin-top: 24px; }
        h3 { font-size: 15px; margin: 8px 0 2px; }
        p, li { font-size: 13px; line-height: 1.5; color: #444; }
        .personal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; }
        .skill-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
        ul { padding-left: 16px; }
      </style></head><body>
      ${content.innerHTML}
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const personal = getByCategory('Personal');
  const experience = getByCategory('Experience');
  const education = getByCategory('Education');
  const skills = getByCategory('Skill');

  const iconForPersonal = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('phone')) return <Phone className="w-4 h-4" />;
    if (t.includes('email')) return <Mail className="w-4 h-4" />;
    if (t.includes('location')) return <MapPin className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  return (
    <>
      <section id="resume" className="py-20 lg:py-32 relative">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              My <span className="gradient-text">Resume</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              View my digital resume to learn more about my experience, skills, and qualifications.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <motion.div
              whileHover={{ y: -4 }}
              className="max-w-2xl mx-auto glass rounded-3xl p-8 md:p-12"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <div className="w-32 h-40 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-xl">
                    <FileText className="w-16 h-16 text-white" />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-display text-2xl font-semibold mb-2">MD Omar Faruque</h3>
                  <p className="text-muted-foreground mb-4">Creative Professional • Designer • Developer</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Get a comprehensive overview of my skills, experience, education, and achievements.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                    <Button variant="outline" onClick={() => setShowModal(true)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Digital Resume
                    </Button>
                    <Button variant="outline" onClick={() => setShowQRModal(true)}>
                      <QrCode className="w-4 h-4 mr-2" />
                      Scan QR Code
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-border">
                <h4 className="font-display text-lg font-semibold mb-6 text-center">Quick Highlights</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Experience', value: '2+ Years' },
                    { label: 'Projects', value: '30+' },
                    { label: 'Skills', value: `${skills.length || '5'}+` },
                    { label: 'Happy Clients', value: '20+' },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-4 rounded-xl bg-secondary/50">
                      <div className="font-display text-xl font-bold gradient-text">{item.value}</div>
                      <div className="text-sm text-muted-foreground">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowQRModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-5 max-w-xs w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full">
              <h3 className="font-display text-lg font-semibold">Scan QR Code</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowQRModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-inner">
              <QRCodeSVG
                value={SITE_URL}
                size={200}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Scan to view my digital resume on mobile
            </p>
          </motion.div>
        </div>
      )}

      {/* Digital Resume Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10 rounded-t-2xl">
              <h3 className="font-display text-lg font-semibold">Digital Resume</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-1" />
                  Print
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Printable Content */}
            <div ref={printRef} className="p-6 md:p-8 space-y-8">
              <div className="text-center">
                <h1 className="font-display text-2xl font-bold">MD Omar Faruque</h1>
                <p className="text-muted-foreground">Creative Professional • Designer • Developer</p>
              </div>

              {/* Personal Info */}
              {personal.length > 0 && (
                <div>
                  <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-3 border-b border-border pb-2">
                    <Mail className="w-5 h-5 text-primary" /> Contact Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {personal.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        {iconForPersonal(item.title)}
                        <span className="font-medium">{item.title}:</span>
                        <span className="text-muted-foreground">{item.subtitle}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {experience.length > 0 && (
                <div>
                  <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-3 border-b border-border pb-2">
                    <Briefcase className="w-5 h-5 text-primary" /> Experience
                  </h2>
                  <div className="space-y-4">
                    {experience.map((item) => (
                      <div key={item.id}>
                        <h3 className="font-semibold">{item.title}</h3>
                        {item.subtitle && <p className="text-sm text-muted-foreground">{item.subtitle}</p>}
                        {item.description && <p className="text-sm mt-1">{item.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {education.length > 0 && (
                <div>
                  <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-3 border-b border-border pb-2">
                    <GraduationCap className="w-5 h-5 text-primary" /> Education
                  </h2>
                  <div className="space-y-4">
                    {education.map((item) => (
                      <div key={item.id}>
                        <h3 className="font-semibold">{item.title}</h3>
                        {item.subtitle && <p className="text-sm text-muted-foreground">{item.subtitle}</p>}
                        {item.description && <p className="text-sm mt-1">{item.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div>
                  <h2 className="font-display text-lg font-semibold flex items-center gap-2 mb-3 border-b border-border pb-2">
                    <Wrench className="w-5 h-5 text-primary" /> Skills
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {skills.map((item) => (
                      <div key={item.id} className="bg-secondary/50 rounded-lg p-3">
                        <span className="font-medium text-sm">{item.title}</span>
                        {item.description && (
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resumeData.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Resume data is being set up. Check back soon!</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
