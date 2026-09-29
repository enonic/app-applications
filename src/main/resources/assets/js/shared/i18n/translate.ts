import { fromPhrases } from '@enonic/ui-utils';

import { $phrases } from './i18n.store';

export const translate = fromPhrases(() => $phrases.get());
