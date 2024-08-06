/** @type {import('next').NextConfig} */
const nextConfig = {
  //   webpack: (config) => {
  //     config.externals.push({
  //       "utf-8-validate": "commonjs utf-8-validate",
  //       bufferutil: "commonjs bufferutil",
  //     });
  // return config;
  //   },
  images: {
    domains: ["uploadthing.com", "utfs.io"],
  },
  /*image: {
		// Use image.remotePatterns instead
		remotePatterns: ["uploadthing.com/*", "utfs.io/*"],
	},*/
  /*images: {
		remotePatterns: [
			{
				hostname: "uploadthing.com",
				pathname: "/path/to/images/*",
			},
			{
				hostname: "utfs.io",
				pathname: "/path/to/images/*",
			},
		],
	},*/
};

export default nextConfig;
