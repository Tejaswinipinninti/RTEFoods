import { motion } from 'framer-motion';
import { Leaf, Heart, Shield, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const values = [
  {
    icon: Leaf,
    title: 'Freshness',
    description: 'We source directly from local farms to ensure every ingredient is fresh and seasonal.',
    gradient: 'from-green-400 to-emerald-500',
  },
  {
    icon: Shield,
    title: 'Quality',
    description: 'Every dish goes through rigorous quality checks to meet our high standards.',
    gradient: 'from-blue-400 to-indigo-500',
  },
  {
    icon: Heart,
    title: 'Sustainability',
    description: 'Eco-friendly packaging and responsible sourcing for a better tomorrow.',
    gradient: 'from-pink-400 to-rose-500',
  },
  {
    icon: Users,
    title: 'Customer First',
    description: 'Your satisfaction drives everything we do. We are here to serve you.',
    gradient: 'from-orange-400 to-amber-500',
  },
];

const team = [
  { name: 'Rajesh Kumar', role: 'Founder & CEO', image: '/team/ceo.jpg' },
  { name: 'Priya Sharma', role: 'Head Chef', image: '/team/chef.jpg' },
  { name: 'Amit Patel', role: 'Operations', image: '/team/ops.jpg' },
  { name: 'Sneha Reddy', role: 'Marketing', image: '/team/marketing.jpg' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <section className="relative py-14 sm:py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-800 mb-4 sm:mb-6"
          >
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Story</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Born from a passion for authentic flavors and a commitment to quality,
            RTE Foods brings the taste of tradition to your doorstep.
          </motion.p>
        </div>
      </section>

      <section className="py-10 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">From Kitchen to Your Door</h2>
              <div className="space-y-3 sm:space-y-4 text-gray-600 text-sm sm:text-base">
                <p>
                  What started as a small home kitchen in 2019 has grown into one of the most
                  loved food delivery services. Our founder, Rajesh, realized that people craved
                  authentic, home-style meals but lacked the time to prepare them.
                </p>
                <p>
                  Today, we partner with over 50 local farms and source the finest ingredients
                  to bring you meals that taste like they were made in your own kitchen.
                  Every dish is prepared with love, using traditional recipes passed down through generations.
                </p>
                <p>
                  We believe food is more than just sustenance. It is an experience that brings
                  people together, creates memories, and nourishes the soul.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-orange-200 to-amber-200 overflow-hidden">
                <img
                  src="/about/kitchen.jpg"
                  alt="Our Kitchen"
                  className="w-full h-full object-cover mix-blend-multiply"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white text-center p-3 sm:p-4 shadow-xl">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold">5+</p>
                  <p className="text-[10px] sm:text-sm">Years of Service</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16 px-4 bg-white/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-8 sm:mb-12">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {values.map((value, idx) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm p-5 sm:p-6 text-center hover:shadow-md transition-all"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${value.gradient} mb-3 sm:mb-4`}>
                  <value.icon size={22} className="text-white sm:hidden" />
                  <value.icon size={24} className="text-white hidden sm:block" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1.5 sm:mb-2 text-sm sm:text-base">{value.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-8 sm:mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {team.map((member, idx) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                <div className="aspect-square bg-gradient-to-br from-orange-100 to-amber-100">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div className="p-3 sm:p-4 text-center">
                  <h3 className="font-bold text-gray-800 text-xs sm:text-base">{member.name}</h3>
                  <p className="text-[10px] sm:text-sm text-orange-600">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-6 sm:p-10 text-white"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Ready to Taste the Difference?</h2>
            <p className="text-white/80 mb-5 sm:mb-6 text-sm sm:text-base">Order now and experience authentic flavors delivered to your doorstep.</p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-orange-600 font-semibold rounded-2xl hover:shadow-xl transition-all text-sm sm:text-base"
            >
              Explore Menu <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
