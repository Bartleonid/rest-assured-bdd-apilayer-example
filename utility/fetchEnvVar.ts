import dotenv from 'dotenv';
dotenv.config();

const fetchEnvVar = (key: string): string | undefined => {
  let envVar = process.env[key];
  if (envVar !== undefined && envVar !== null && envVar.trim() !== '') {
    return envVar;
  }
  console.error(`Environment variable "${key}" is not defined.`);
  return undefined;
};

export default fetchEnvVar;
