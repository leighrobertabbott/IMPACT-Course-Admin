import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Users, 
  Award, 
  BookOpen, 
  Target, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Building2,
  GraduationCap,
  Stethoscope,
  Heart,
  Brain,
  Activity,
  Shield,
  Clock,
  PoundSterling
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-nhs-blue/5 via-white to-nhs-green/5">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-nhs-blue to-nhs-dark-blue text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                IMPACT Course
              </h1>
              <p className="text-xl md:text-2xl font-light">
                Ill Medical Patients' Acute Care and Treatment
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
                <div className="flex items-center space-x-2">
                  <Building2 size={24} />
                  <span className="text-lg">Whiston Hospital</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users size={24} />
                  <span className="text-lg">Mersey and West Lancashire Teaching Hospitals NHS Trust</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/apply" 
                className="bg-white text-nhs-blue px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Apply Now</span>
                <ArrowRight size={20} />
              </Link>
              <Link 
                to="/login" 
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-nhs-blue transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Whiston Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-nhs-dark-grey mb-4">
                Why Choose Whiston Hospital?
              </h2>
              <div className="w-24 h-1 bg-nhs-blue mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-lg text-nhs-grey leading-relaxed mb-6">
                  Whiston Hospital is the flagship site of Mersey and West Lancashire Teaching Hospitals NHS Trust (MWL). 
                  Serving over <strong>600,000 people</strong> across Merseyside and West Lancashire, the Trust is home to 
                  more than <strong>9,000 staff</strong> and delivers "Five Star Patient Care" across multiple hospitals 
                  and community services.
                </p>
                <p className="text-lg text-nhs-grey leading-relaxed">
                  Whiston is also the base for several specialist centres of excellence, including the 
                  <strong> Mersey Regional Burns and Plastic Surgery Unit</strong>. Its reputation as a hub for 
                  high-quality training and patient care makes it an ideal setting to host the IMPACT Course for 
                  doctors preparing to manage acute medical admissions.
                </p>
              </div>
              <div className="bg-nhs-pale-grey rounded-lg p-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Star className="text-nhs-blue" size={24} />
                    <span className="font-semibold text-nhs-dark-grey">Flagship Site</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="text-nhs-blue" size={24} />
                    <span className="font-semibold text-nhs-dark-grey">600,000+ Population Served</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building2 className="text-nhs-blue" size={24} />
                    <span className="font-semibold text-nhs-dark-grey">9,000+ Staff</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="text-nhs-blue" size={24} />
                    <span className="font-semibold text-nhs-dark-grey">Specialist Centres of Excellence</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Is IMPACT Section */}
      <section className="py-16 bg-nhs-pale-grey">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-nhs-dark-grey mb-4">
                What Is the IMPACT Course?
              </h2>
              <div className="w-24 h-1 bg-nhs-blue mx-auto"></div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <p className="text-lg text-nhs-grey leading-relaxed mb-6">
                The <strong>Ill Medical Patients' Acute Care and Treatment (IMPACT) Course</strong> is a two-day 
                intensive training programme designed to equip doctors with the essential skills and confidence 
                needed to manage acutely unwell patients during the "medical take."
              </p>
              <p className="text-lg text-nhs-grey leading-relaxed">
                Developed by the <strong>Federation of Royal Medical Colleges</strong> in collaboration with the 
                <strong> Royal College of Anaesthetists</strong>, and endorsed by the <strong>Resuscitation Council UK</strong>, 
                the <strong>Intensive Care Society</strong>, and the <strong>Society of Acute Medicine</strong>, 
                the course is recognised nationally for raising standards in acute care training.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 text-center shadow-md">
                <Calendar className="text-nhs-blue mx-auto mb-4" size={48} />
                <h3 className="text-xl font-semibold text-nhs-dark-grey mb-2">2-Day Intensive</h3>
                <p className="text-nhs-grey">Comprehensive training programme</p>
              </div>
              <div className="bg-white rounded-lg p-6 text-center shadow-md">
                <Target className="text-nhs-blue mx-auto mb-4" size={48} />
                <h3 className="text-xl font-semibold text-nhs-dark-grey mb-2">Nationally Recognised</h3>
                <p className="text-nhs-grey">Endorsed by leading medical bodies</p>
              </div>
              <div className="bg-white rounded-lg p-6 text-center shadow-md">
                <Stethoscope className="text-nhs-blue mx-auto mb-4" size={48} />
                <h3 className="text-xl font-semibold text-nhs-dark-grey mb-2">Practical Skills</h3>
                <p className="text-nhs-grey">Hands-on procedural training</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Should Attend Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-nhs-dark-grey mb-4">
                Who Should Attend?
              </h2>
              <div className="w-24 h-1 bg-nhs-blue mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-nhs-dark-grey mb-4">The course is ideal for:</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-nhs-green mt-1" size={20} />
                    <span className="text-nhs-grey">Internal Medicine Trainees (IMT 1–3)</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-nhs-green mt-1" size={20} />
                    <span className="text-nhs-grey">Acute Medicine / General Internal Medicine trainees</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-nhs-green mt-1" size={20} />
                    <span className="text-nhs-grey">Acute Care Common Stem (ACCS) trainees</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-nhs-green mt-1" size={20} />
                    <span className="text-nhs-grey">FY2 doctors with at least 8 months of acute specialty experience</span>
                  </div>
                </div>
              </div>
              <div className="bg-nhs-pale-grey rounded-lg p-6">
                <h3 className="text-xl font-semibold text-nhs-dark-grey mb-4">Prerequisite</h3>
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="text-nhs-blue" size={24} />
                  <span className="font-semibold text-nhs-dark-grey">Completion of an Advanced Life Support (ALS) course</span>
                </div>
                <p className="text-nhs-grey text-sm">
                  <strong>Note:</strong> Content is pitched at IMT level, so FY2 doctors should have substantial 
                  acute specialty experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Format Section */}
      <section className="py-16 bg-nhs-pale-grey">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-nhs-dark-grey mb-4">
                Course Format
              </h2>
              <div className="w-24 h-1 bg-nhs-blue mx-auto"></div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <p className="text-lg text-nhs-grey leading-relaxed mb-6">
                IMPACT at Whiston Hospital combines a blended learning approach to ensure both knowledge retention 
                and practical application in real-world settings.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <BookOpen className="text-nhs-blue mb-4" size={32} />
                <h3 className="text-lg font-semibold text-nhs-dark-grey mb-2">Pre-course E-learning</h3>
                <p className="text-nhs-grey text-sm">Online modules and reading materials</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <GraduationCap className="text-nhs-blue mb-4" size={32} />
                <h3 className="text-lg font-semibold text-nhs-dark-grey mb-2">Lectures & Keynotes</h3>
                <p className="text-nhs-grey text-sm">Core acute presentations</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <Users className="text-nhs-blue mb-4" size={32} />
                <h3 className="text-lg font-semibold text-nhs-dark-grey mb-2">Interactive Workshops</h3>
                <p className="text-nhs-grey text-sm">Small group sessions</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <Stethoscope className="text-nhs-blue mb-4" size={32} />
                <h3 className="text-lg font-semibold text-nhs-dark-grey mb-2">Procedural Skills</h3>
                <p className="text-nhs-grey text-sm">Central lines, chest drains, lumbar puncture</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <Activity className="text-nhs-blue mb-4" size={32} />
                <h3 className="text-lg font-semibold text-nhs-dark-grey mb-2">Scenario Simulations</h3>
                <p className="text-nhs-grey text-sm">Critically ill patient scenarios</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <Award className="text-nhs-blue mb-4" size={32} />
                <h3 className="text-lg font-semibold text-nhs-dark-grey mb-2">Faculty Feedback</h3>
                <p className="text-nhs-grey text-sm">Expert guidance and assessment</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Topics Covered Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-nhs-dark-grey mb-4">
                Typical Topics Covered
              </h2>
              <div className="w-24 h-1 bg-nhs-blue mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-nhs-pale-grey rounded-lg">
                <Target className="text-nhs-blue" size={20} />
                <span className="text-nhs-dark-grey">Triage & Resource Management</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-nhs-pale-grey rounded-lg">
                <Heart className="text-nhs-blue" size={20} />
                <span className="text-nhs-dark-grey">Breathlessness and Shock</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-nhs-pale-grey rounded-lg">
                <Activity className="text-nhs-blue" size={20} />
                <span className="text-nhs-dark-grey">Chest Pain & Arrhythmias</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-nhs-pale-grey rounded-lg">
                <Shield className="text-nhs-blue" size={20} />
                <span className="text-nhs-dark-grey">Sepsis & Poisoning</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-nhs-pale-grey rounded-lg">
                <Target className="text-nhs-blue" size={20} />
                <span className="text-nhs-dark-grey">Acute Kidney Injury</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-nhs-pale-grey rounded-lg">
                <Brain className="text-nhs-blue" size={20} />
                <span className="text-nhs-dark-grey">Neurological Emergencies</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-nhs-pale-grey rounded-lg">
                <Heart className="text-nhs-blue" size={20} />
                <span className="text-nhs-dark-grey">Fluids, Transfusions & Electrolyte Imbalances</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-nhs-pale-grey rounded-lg">
                <Activity className="text-nhs-blue" size={20} />
                <span className="text-nhs-dark-grey">Respiratory Support and Airway Management</span>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-nhs-pale-grey rounded-lg">
                <Target className="text-nhs-blue" size={20} />
                <span className="text-nhs-dark-grey">"Difficult Decisions" in acute care</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Attend at Whiston Section */}
      <section className="py-16 bg-nhs-pale-grey">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-nhs-dark-grey mb-4">
                Why Attend at Whiston?
              </h2>
              <div className="w-24 h-1 bg-nhs-blue mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Star className="text-nhs-blue mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-nhs-dark-grey mb-1">Regional Reputation</h3>
                    <p className="text-nhs-grey">Whiston Hospital is a centre of excellence, with advanced facilities and a culture of teaching.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Building2 className="text-nhs-blue mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-nhs-dark-grey mb-1">Specialist Exposure</h3>
                    <p className="text-nhs-grey">Learn in a hospital that hosts both regional burns/plastics and acute medicine services.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Users className="text-nhs-blue mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-nhs-dark-grey mb-1">Expert Faculty</h3>
                    <p className="text-nhs-grey">Training delivered by experienced consultants and senior doctors from MWL and the wider region.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <MapPin className="text-nhs-blue mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-nhs-dark-grey mb-1">Convenient Location</h3>
                    <p className="text-nhs-grey">Easily accessible from Liverpool, St Helens, Wigan, Warrington, and West Lancashire.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <h3 className="text-xl font-semibold text-nhs-dark-grey mb-4">Key Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="text-nhs-blue" size={20} />
                    <span className="text-nhs-grey"><strong>Duration:</strong> 2 Days</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="text-nhs-blue" size={20} />
                    <span className="text-nhs-grey"><strong>Location:</strong> Education Centre, Whiston Hospital</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="text-nhs-blue" size={20} />
                    <span className="text-nhs-grey"><strong>Entry Requirement:</strong> Completed ALS course</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="text-nhs-blue" size={20} />
                    <span className="text-nhs-grey"><strong>Accreditation:</strong> Federation of Royal Medical Colleges</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PoundSterling className="text-nhs-blue" size={20} />
                    <span className="text-nhs-grey"><strong>Cost:</strong> £500 for both days (food provided)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Apply Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-nhs-dark-grey mb-4">
                How to Apply
              </h2>
              <div className="w-24 h-1 bg-nhs-blue mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-nhs-pale-grey rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-nhs-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold text-nhs-dark-grey mb-2">Check Eligibility</h3>
                <p className="text-nhs-grey text-sm">Ensure you meet the ALS and training requirements</p>
              </div>
              <div className="bg-nhs-pale-grey rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-nhs-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold text-nhs-dark-grey mb-2">Complete Application</h3>
                <p className="text-nhs-grey text-sm">Fill out the online application form</p>
              </div>
              <div className="bg-nhs-pale-grey rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-nhs-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold text-nhs-dark-grey mb-2">Pre-course Learning</h3>
                <p className="text-nhs-grey text-sm">Receive joining instructions and online modules</p>
              </div>
              <div className="bg-nhs-pale-grey rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-nhs-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">4</span>
                </div>
                <h3 className="font-semibold text-nhs-dark-grey mb-2">Attend Course</h3>
                <p className="text-nhs-grey text-sm">Join us at Whiston Hospital's education centre</p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link 
                to="/apply" 
                className="bg-nhs-blue text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-nhs-dark-blue transition-colors inline-flex items-center space-x-2"
              >
                <span>Start Your Application</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-nhs-dark-grey text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h2>
              <p className="text-xl text-gray-300">
                For course dates, availability, and application queries
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <MapPin className="text-nhs-blue mx-auto mb-4" size={32} />
                <h3 className="font-semibold mb-2">Location</h3>
                <p className="text-gray-300">
                  Whiston Hospital<br />
                  Prescot, Merseyside<br />
                  L35 5DR
                </p>
              </div>
              <div className="text-center">
                <Phone className="text-nhs-blue mx-auto mb-4" size={32} />
                <h3 className="font-semibold mb-2">Phone</h3>
                <p className="text-gray-300">0151 430 1086</p>
              </div>
              <div className="text-center">
                <Mail className="text-nhs-blue mx-auto mb-4" size={32} />
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-gray-300">impact@sthk.nhs.uk</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-nhs-blue to-nhs-green text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Take the Next Step in Your Acute Care Training
            </h2>
            <p className="text-xl mb-8 text-gray-100">
              Join the IMPACT Course at Whiston Hospital and build the confidence to manage the sickest patients on the medical take.
            </p>
            <Link 
              to="/apply" 
              className="bg-white text-nhs-blue px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
            >
              <span>Apply Now</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

