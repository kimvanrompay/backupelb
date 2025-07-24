import {getKnexInstance} from '@lib/db';

const db = await getKnexInstance();

export {db};
