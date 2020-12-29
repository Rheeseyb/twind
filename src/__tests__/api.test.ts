import { suite } from 'uvu'
import * as assert from 'uvu/assert'

import type { Instance, InlineDirective } from '../types'
import type { VirtualSheet } from '../sheets/index'

import { virtualSheet } from '../sheets/index'
import { create, strict } from '../index'

import data from './api.json'

const test = suite<{
  sheet: VirtualSheet
  tw: Instance['tw']
  setup: Instance['setup']
}>('api')

test.before((context) => {
  context.sheet = virtualSheet()
  const instance = create({
    sheet: context.sheet,
    mode: strict,
    preflight: false,
    prefix: false,
    theme: {
      extend: {
        colors: { fuchsia: 'fuchsia' },
        backgroundImage: {
          'hero-pattern': "url('/img/hero-pattern.svg')",
        },
      },
    },
  })
  context.tw = instance.tw
  context.setup = instance.setup
})

test.after.each(({ sheet }) => {
  sheet.reset()
})

// "bg-#f87171": ".bg-\\#f87171{--bg-opacity:1;background-color:#f87171;background-color:rgba(248,113,113,var(--bg-opacity));--text-opacity:1}",
// "group hover:bg-surface": [
//   "group hover:bg-surface",
//   [".hover\\:bg-surface:hover{background-color:#fff;color:#111}"]
// ],
Object.entries(data)
  .map(([tokens, declarations]): [string, string, string[]] => {
    if (Array.isArray(declarations)) {
      // "group hover:bg-surface": [
      //   "group hover:bg-surface",
      //   [".hover\\:bg-surface:hover{background-color:#fff;color:#111}"]
      // ],
      return [tokens, declarations[0] as string, declarations[1] as string[]]
    }

    return [tokens, tokens, [declarations]]
  })
  .forEach(([tokens, classNames, rules]) =>
    test(`tw(${JSON.stringify(tokens)}) => ${classNames}`, ({ sheet, tw }) => {
      assert.is(tw(tokens), classNames)
      assert.equal(sheet.target, rules)

      // Cached access
      assert.is(tw(tokens), classNames)
      assert.equal(sheet.target, rules)
    }),
  )

test('variant pseudo presedence', ({ sheet, tw }) => {
  assert.is(
    tw`
    active:text-blue-200
    empty:text-green-500
    group-invalid:text-red-400
    checked:text-gray-500
    link:text-green-100
    disabled:text-blue-300
    even:text-gray-300
    first:text-gray-50
    focus-visible:text-blue-100
    focus-within:text-gray-800
    focus:text-blue-50
    group-focus:text-gray-700
    group-hover:text-gray-600
    hover:text-gray-900
    invalid:text-blue-600
    last:text-gray-100
    odd:text-gray-200
    optional:text-blue-800
    read-only:text-blue-700
    required:text-blue-400
    valid:text-blue-500
    visited:text-gray-400
  `,
    'active:text-blue-200 empty:text-green-500 group-invalid:text-red-400 checked:text-gray-500 link:text-green-100 disabled:text-blue-300 even:text-gray-300 first:text-gray-50 focus-visible:text-blue-100 focus-within:text-gray-800 focus:text-blue-50 group-focus:text-gray-700 group-hover:text-gray-600 hover:text-gray-900 invalid:text-blue-600 last:text-gray-100 odd:text-gray-200 optional:text-blue-800 read-only:text-blue-700 required:text-blue-400 valid:text-blue-500 visited:text-gray-400',
  )

  assert.equal(sheet.target, [
    '.first\\:text-gray-50:first-child{--tw-text-opacity:1;color:#f9fafb;color:rgba(249,250,251,var(--tw-text-opacity))}',
    '.last\\:text-gray-100:last-child{--tw-text-opacity:1;color:#f3f4f6;color:rgba(243,244,246,var(--tw-text-opacity))}',
    '.even\\:text-gray-300:nth-child(2n){--tw-text-opacity:1;color:#d1d5db;color:rgba(209,213,219,var(--tw-text-opacity))}',
    '.odd\\:text-gray-200:nth-child(odd){--tw-text-opacity:1;color:#e5e7eb;color:rgba(229,231,235,var(--tw-text-opacity))}',
    '.link\\:text-green-100:link{--tw-text-opacity:1;color:#d1fae5;color:rgba(209,250,229,var(--tw-text-opacity))}',
    '.visited\\:text-gray-400:visited{--tw-text-opacity:1;color:#9ca3af;color:rgba(156,163,175,var(--tw-text-opacity))}',
    '.empty\\:text-green-500:empty{--tw-text-opacity:1;color:#10b981;color:rgba(16,185,129,var(--tw-text-opacity))}',
    '.checked\\:text-gray-500:checked{--tw-text-opacity:1;color:#6b7280;color:rgba(107,114,128,var(--tw-text-opacity))}',
    '.focus-within\\:text-gray-800:focus-within{--tw-text-opacity:1;color:#1f2937;color:rgba(31,41,55,var(--tw-text-opacity))}',
    '.group:hover .group-hover\\:text-gray-600{--tw-text-opacity:1;color:#4b5563;color:rgba(75,85,99,var(--tw-text-opacity))}',
    '.hover\\:text-gray-900:hover{--tw-text-opacity:1;color:#111827;color:rgba(17,24,39,var(--tw-text-opacity))}',
    '.focus\\:text-blue-50:focus{--tw-text-opacity:1;color:#eff6ff;color:rgba(239,246,255,var(--tw-text-opacity))}',
    '.group:focus .group-focus\\:text-gray-700{--tw-text-opacity:1;color:#374151;color:rgba(55,65,81,var(--tw-text-opacity))}',
    '.focus-visible\\:text-blue-100:focus-visible{--tw-text-opacity:1;color:#dbeafe;color:rgba(219,234,254,var(--tw-text-opacity))}',
    '.active\\:text-blue-200:active{--tw-text-opacity:1;color:#bfdbfe;color:rgba(191,219,254,var(--tw-text-opacity))}',
    '.disabled\\:text-blue-300:disabled{--tw-text-opacity:1;color:#93c5fd;color:rgba(147,197,253,var(--tw-text-opacity))}',
    '.read-only\\:text-blue-700:read-only{--tw-text-opacity:1;color:#1d4ed8;color:rgba(29,78,216,var(--tw-text-opacity))}',
    '.optional\\:text-blue-800:optional{--tw-text-opacity:1;color:#1e40af;color:rgba(30,64,175,var(--tw-text-opacity))}',
    '.required\\:text-blue-400:required{--tw-text-opacity:1;color:#60a5fa;color:rgba(96,165,250,var(--tw-text-opacity))}',
    '.group:invalid .group-invalid\\:text-red-400{--tw-text-opacity:1;color:#f87171;color:rgba(248,113,113,var(--tw-text-opacity))}',
    '.invalid\\:text-blue-600:invalid{--tw-text-opacity:1;color:#2563eb;color:rgba(37,99,235,var(--tw-text-opacity))}',
    '.valid\\:text-blue-500:valid{--tw-text-opacity:1;color:#3b82f6;color:rgba(59,130,246,var(--tw-text-opacity))}',
  ])
})

test('responsive presedence', ({ sheet, tw }) => {
  assert.is(tw`m(lg:9 2xl:6 xl:5 md:9 sm:7 8)`, 'lg:m-9 2xl:m-6 xl:m-5 md:m-9 sm:m-7 m-8')
  assert.equal(sheet.target, [
    '.m-8{margin:2rem}',
    '@media (min-width: 640px){.sm\\:m-7{margin:1.75rem}}',
    '@media (min-width: 768px){.md\\:m-9{margin:2.25rem}}',
    '@media (min-width: 1024px){.lg\\:m-9{margin:2.25rem}}',
    '@media (min-width: 1280px){.xl\\:m-5{margin:1.25rem}}',
    '@media (min-width: 1536px){.\\32 xl\\:m-6{margin:1.5rem}}',
  ])
})

test('at-rules presedence', ({ sheet, tw }) => {
  assert.is(
    tw`m(lg:9 sticky:6 motion-reduce:5 md:dark:4 motion-safe:9 dark:7 lg:motion-safe:12 8)`,
    'lg:m-9 sticky:m-6 motion-reduce:m-5 md:dark:m-4 motion-safe:m-9 dark:m-7 lg:motion-safe:m-12 m-8',
  )
  assert.equal(sheet.target, [
    '.m-8{margin:2rem}',
    '@media (prefers-reduced-motion:reduce){.motion-reduce\\:m-5{margin:1.25rem}}',
    '@supports ((position: -webkit-sticky) or (position:sticky)){.sticky\\:m-6{margin:1.5rem}}',
    '@media (prefers-reduced-motion:no-preference){.motion-safe\\:m-9{margin:2.25rem}}',
    '@media (prefers-color-scheme:dark){.dark\\:m-7{margin:1.75rem}}',
    '@media (min-width: 768px){@media (prefers-color-scheme:dark){.md\\:dark\\:m-4{margin:1rem}}}',
    '@media (min-width: 1024px){.lg\\:m-9{margin:2.25rem}}',
    '@media (min-width: 1024px){@media (prefers-reduced-motion:no-preference){.lg\\:motion-safe\\:m-12{margin:3rem}}}',
  ])
})

test('properties presedence (border)', ({ sheet, tw }) => {
  assert.is(
    tw`border rounded rounded-t-sm border-2 border-lrt-4 border-t-8 border-gray-300 border-dashed`,
    'border rounded rounded-t-sm border-2 border-lrt-4 border-t-8 border-gray-300 border-dashed',
  )
  assert.equal(sheet.target, [
    '.border-gray-300{--tw-border-opacity:1;border-color:#d1d5db;border-color:rgba(209,213,219,var(--tw-border-opacity))}',
    '.border{border-width:1px}',
    '.border-2{border-width:2px}',
    '.border-dashed{border-style:dashed}',
    '.rounded{border-radius:0.25rem}',
    '.border-lrt-4{border-left-width:4px;border-right-width:4px;border-top-width:4px}',
    '.border-t-8{border-top-width:8px}',
    '.rounded-t-sm{border-top-left-radius:0.125rem;border-top-right-radius:0.125rem}',
  ])
})

test('properties presedence (gradient)', ({ sheet, tw }) => {
  assert.is(
    tw`bg-gradient-to-r from-purple-400 via-pink-500 to-red-500`,
    'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500',
  )
  assert.equal(sheet.target, [
    '.bg-gradient-to-r{background-image:linear-gradient(to right,var(--tw-gradient-stops,var(--tw-gradient-from,transparent),var(--tw-gradient-to,transparent)))}',
    '.from-purple-400{--tw-gradient-from:#a78bfa}',
    '.via-pink-500{--tw-gradient-stops:var(--tw-gradient-from,transparent),#ec4899,var(--tw-gradient-to,transparent)}',
    '.to-red-500{--tw-gradient-to:#ef4444}',
  ])
})

test('properties presedence (divide)', ({ sheet, tw }) => {
  assert.is(
    tw`divide(x x-reverse opacity-75 green-500)`,
    'divide-x divide-x-reverse divide-opacity-75 divide-green-500',
  )
  assert.equal(sheet.target, [
    '.divide-green-500>:not([hidden])~:not([hidden]){--tw-divide-opacity:1;border-color:#10b981;border-color:rgba(16,185,129,var(--tw-divide-opacity))}',
    '.divide-x>:not([hidden])~:not([hidden]){--tw-divide-x-reverse:0;border-right-width:calc(1px * var(--tw-divide-x-reverse));border-left-width:1px;border-left-width:calc(1px * calc(1 - var(--tw-divide-x-reverse)))}',
    '.divide-x-reverse>:not([hidden])~:not([hidden]){--tw-divide-x-reverse:1}',
    '.divide-opacity-75>:not([hidden])~:not([hidden]){--tw-divide-opacity:0.75}',
  ])
})
;[
  [
    ['bg-white', false && 'rounded'],
    'bg-white',
    [
      '.bg-white{--tw-bg-opacity:1;background-color:#fff;background-color:rgba(255,255,255,var(--tw-bg-opacity))}',
    ],
  ],
  [
    ['bg-white', true && 'rounded'],
    'bg-white rounded',
    [
      '.bg-white{--tw-bg-opacity:1;background-color:#fff;background-color:rgba(255,255,255,var(--tw-bg-opacity))}',
      '.rounded{border-radius:0.25rem}',
    ],
  ],
  [
    ['bg-white', true, false, '', 'text-black', null, undefined, 0, Number.NaN],
    'bg-white text-black',
    [
      '.text-black{--tw-text-opacity:1;color:#000;color:rgba(0,0,0,var(--tw-text-opacity))}',
      '.bg-white{--tw-bg-opacity:1;background-color:#fff;background-color:rgba(255,255,255,var(--tw-bg-opacity))}',
    ],
  ],
  [
    { 'bg-white': true, rounded: false },
    'bg-white',
    [
      '.bg-white{--tw-bg-opacity:1;background-color:#fff;background-color:rgba(255,255,255,var(--tw-bg-opacity))}',
    ],
  ],
  [
    { 'bg-white': true, rounded: true },
    'bg-white rounded',
    [
      '.bg-white{--tw-bg-opacity:1;background-color:#fff;background-color:rgba(255,255,255,var(--tw-bg-opacity))}',
      '.rounded{border-radius:0.25rem}',
    ],
  ],
  [
    {
      sm: ['hover:rounded', 'active:rounded-full'],
      md: { rounded: true, hover: 'bg-white' },
      lg: {
        'rounded-full': true,
        hover: 'bg-white text-black active:(underline shadow)',
      },
    },
    'sm:hover:rounded sm:active:rounded-full md:rounded md:hover:bg-white lg:rounded-full lg:hover:bg-white lg:hover:text-black lg:hover:active:underline lg:hover:active:shadow',
    [
      '@media (min-width: 640px){.sm\\:hover\\:rounded:hover{border-radius:0.25rem}}',
      '@media (min-width: 640px){.sm\\:active\\:rounded-full:active{border-radius:9999px}}',
      '@media (min-width: 768px){.md\\:rounded{border-radius:0.25rem}}',
      '@media (min-width: 768px){.md\\:hover\\:bg-white:hover{--tw-bg-opacity:1;background-color:#fff;background-color:rgba(255,255,255,var(--tw-bg-opacity))}}',
      '@media (min-width: 1024px){.lg\\:rounded-full{border-radius:9999px}}',
      '@media (min-width: 1024px){.lg\\:hover\\:text-black:hover{--tw-text-opacity:1;color:#000;color:rgba(0,0,0,var(--tw-text-opacity))}}',
      '@media (min-width: 1024px){.lg\\:hover\\:bg-white:hover{--tw-bg-opacity:1;background-color:#fff;background-color:rgba(255,255,255,var(--tw-bg-opacity))}}',
      '@media (min-width: 1024px){.lg\\:hover\\:active\\:shadow:hover:active{--tw-shadow:0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);box-shadow:0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);box-shadow:var(--tw-ring-offset-shadow,0 0 transparent),var(--tw-ring-shadow,0 0 transparent),var(--tw-shadow,0 0 transparent)}}',
      '@media (min-width: 1024px){.lg\\:hover\\:active\\:underline:hover:active{text-decoration:underline}}',
    ],
  ],
].forEach(([tokens, classNames, rules]) =>
  test(`tw(${JSON.stringify(tokens)}) => ${classNames}`, ({ sheet, tw }) => {
    assert.is(tw(tokens), classNames)
    assert.equal(sheet.target, rules)

    // Cached access
    assert.is(tw(tokens), classNames)
    assert.equal(sheet.target, rules)
  }),
)

/* eslint-disable no-template-curly-in-string */
test('tw`bg-white ${false && "rounded"}`', ({ sheet, tw }) => {
  assert.is(tw`bg-white ${false && 'rounded'}`, 'bg-white')
  assert.equal(sheet.target, [
    '.bg-white{--tw-bg-opacity:1;background-color:#fff;background-color:rgba(255,255,255,var(--tw-bg-opacity))}',
  ])
})

test('tw`bg-white ${true && "rounded"}`', ({ sheet, tw }) => {
  assert.is(tw`bg-white ${true && 'rounded'}`, 'bg-white rounded')
  assert.equal(sheet.target, [
    '.bg-white{--tw-bg-opacity:1;background-color:#fff;background-color:rgba(255,255,255,var(--tw-bg-opacity))}',
    '.rounded{border-radius:0.25rem}',
  ])
})

test('tw`bg-white ${{rounded: true}}`', ({ sheet, tw }) => {
  assert.is(tw`bg-white ${{ rounded: true }}`, 'bg-white rounded')
  assert.equal(sheet.target, [
    '.bg-white{--tw-bg-opacity:1;background-color:#fff;background-color:rgba(255,255,255,var(--tw-bg-opacity))}',
    '.rounded{border-radius:0.25rem}',
  ])
})

test('tw`bg-white ${{rounded: false}}`', ({ sheet, tw }) => {
  assert.is(tw`bg-white ${{ rounded: false }}`, 'bg-white')
  assert.equal(sheet.target, [
    '.bg-white{--tw-bg-opacity:1;background-color:#fff;background-color:rgba(255,255,255,var(--tw-bg-opacity))}',
  ])
})

test('tw`bg-white sm:${["rounded"]} text-black hover:${{sm: ({tw}) => tw`underline`, lg: "line-through"}} font(${{bold: true}})`', ({
  sheet,
  tw,
}) => {
  assert.is(
    tw`bg-white sm:${['rounded']} text-black hover:${{
      sm: ({ tw }) => tw`underline`,
      lg: 'no-underline line-through',
    }} font(${{ bold: true }})`,
    'bg-white sm:rounded text-black hover:sm:underline hover:lg:no-underline hover:lg:line-through font-bold',
  )
  assert.equal(sheet.target, [
    '.text-black{--tw-text-opacity:1;color:#000;color:rgba(0,0,0,var(--tw-text-opacity))}',
    '.bg-white{--tw-bg-opacity:1;background-color:#fff;background-color:rgba(255,255,255,var(--tw-bg-opacity))}',
    '.font-bold{font-weight:700}',
    '@media (min-width: 640px){.sm\\:rounded{border-radius:0.25rem}}',
    '@media (min-width: 640px){.hover\\:sm\\:underline:hover{text-decoration:underline}}',
    '@media (min-width: 1024px){.hover\\:lg\\:no-underline:hover{text-decoration:none}}',
    '@media (min-width: 1024px){.hover\\:lg\\:line-through:hover{text-decoration:line-through}}',
  ])
})

test('tw`bg(${"fuchsia"}) rounded(${"xl"})`', ({ sheet, tw }) => {
  assert.is(tw`bg(${'fuchsia'}) rounded(${'xl'})`, 'bg-fuchsia rounded-xl')
  assert.equal(sheet.target, [
    '.bg-fuchsia{background-color:fuchsia}',
    '.rounded-xl{border-radius:0.75rem}',
  ])
})

test('tw`bg-${"fuchsia"}) sm:${"underline"} lg:${false && "line-through"} text-${["underline", "center"]} rounded-${{lg: false, xl: true}})`', ({
  sheet,
  tw,
}) => {
  assert.is(
    tw`bg-${'fuchsia'} sm:${'underline'} lg:${false && 'line-through'} text-${[
      'underline',
      'center',
    ]} rounded-${{
      lg: false,
      xl: true,
    }}`,
    'bg-fuchsia sm:underline text-underline text-center rounded-xl',
  )
  assert.equal(sheet.target, [
    '.bg-fuchsia{background-color:fuchsia}',
    '.text-underline{text-decoration:underline}',
    '.text-center{text-align:center}',
    '.rounded-xl{border-radius:0.75rem}',
    '@media (min-width: 640px){.sm\\:underline{text-decoration:underline}}',
  ])
})
/* eslint-enable no-template-curly-in-string */

test('container center', ({ sheet }) => {
  const { tw } = create({
    sheet: sheet,
    prefix: false,
    preflight: false,
    mode: strict,
    theme: {
      extend: {
        container: {
          center: true,
        },
      },
    },
  })

  assert.is(tw`container`, 'container')
  assert.equal(sheet.target, [
    '.container{width:100%;margin-right:auto;margin-left:auto}',
    '@media (min-width: 640px){.container{max-width:640px}}',
    '@media (min-width: 768px){.container{max-width:768px}}',
    '@media (min-width: 1024px){.container{max-width:1024px}}',
    '@media (min-width: 1280px){.container{max-width:1280px}}',
    '@media (min-width: 1536px){.container{max-width:1536px}}',
  ])
})

test('container padding', ({ sheet }) => {
  const { tw } = create({
    sheet: sheet,
    prefix: false,
    preflight: false,
    mode: strict,
    theme: {
      extend: {
        container: {
          padding: '2rem',
        },
      },
    },
  })

  assert.is(tw`container`, 'container')
  assert.equal(sheet.target, [
    '.container{width:100%;padding-right:2rem;padding-left:2rem}',
    '@media (min-width: 640px){.container{max-width:640px;padding-right:2rem;padding-left:2rem}}',
    '@media (min-width: 768px){.container{max-width:768px;padding-right:2rem;padding-left:2rem}}',
    '@media (min-width: 1024px){.container{max-width:1024px;padding-right:2rem;padding-left:2rem}}',
    '@media (min-width: 1280px){.container{max-width:1280px;padding-right:2rem;padding-left:2rem}}',
    '@media (min-width: 1536px){.container{max-width:1536px;padding-right:2rem;padding-left:2rem}}',
  ])
})

test('container padding per screeen', ({ sheet }) => {
  const { tw } = create({
    sheet: sheet,
    prefix: false,
    preflight: false,
    mode: strict,
    theme: {
      extend: {
        container: {
          padding: {
            DEFAULT: '1rem',
            sm: '2rem',
            lg: '4rem',
            xl: '5rem',
            '2xl': '6rem',
          },
        },
      },
    },
  })

  assert.is(tw`container`, 'container')
  assert.equal(sheet.target, [
    '.container{width:100%;padding-right:1rem;padding-left:1rem}',
    '@media (min-width: 640px){.container{max-width:640px;padding-right:2rem;padding-left:2rem}}',
    '@media (min-width: 768px){.container{max-width:768px;padding-right:1rem;padding-left:1rem}}',
    '@media (min-width: 1024px){.container{max-width:1024px;padding-right:4rem;padding-left:4rem}}',
    '@media (min-width: 1280px){.container{max-width:1280px;padding-right:5rem;padding-left:5rem}}',
    '@media (min-width: 1536px){.container{max-width:1536px;padding-right:6rem;padding-left:6rem}}',
  ])
})

test('responsive if theme screens uses non px values', ({ sheet }) => {
  const { tw } = create({
    sheet: sheet,
    prefix: false,
    preflight: false,
    mode: strict,
    theme: {
      screens: {
        sm: '40rem',
        md: '48rem',
        lg: '64rem',
        xl: '80rem',
        '2xl': '96rem',
      },
    },
  })

  assert.is(tw`m(xl:8 2xl:16 sm:2 md:3 lg:4 1)`, 'xl:m-8 2xl:m-16 sm:m-2 md:m-3 lg:m-4 m-1')
  assert.equal(sheet.target, [
    '.m-1{margin:0.25rem}',
    '@media (min-width: 40rem){.sm\\:m-2{margin:0.5rem}}',
    '@media (min-width: 48rem){.md\\:m-3{margin:0.75rem}}',
    '@media (min-width: 64rem){.lg\\:m-4{margin:1rem}}',
    '@media (min-width: 80rem){.xl\\:m-8{margin:2rem}}',
    '@media (min-width: 96rem){.\\32 xl\\:m-16{margin:4rem}}',
  ])
})

test('falsy arguments', ({ tw }) => {
  assert.is(tw(true, false, '', null, undefined, 0, Number.NaN), '')
  assert.is(tw(''), '')
})

test('empty arguments', ({ tw }) => {
  assert.is(tw(''), '')
  assert.is(tw([]), '')
  assert.is(tw({}), '')
})

test('no arguments', ({ tw }) => {
  assert.is(tw(), '')
})

test('inline rule (css object)', ({ sheet, tw }) => {
  assert.is(
    tw(({ theme }) => ({ color: theme('colors', 'red.500') })),
    'tw-1e4d9nh',
  )
  assert.equal(sheet.target, ['.tw-1e4d9nh{color:#ef4444}'])
})

test('inline rule (tag)', ({ sheet, tw }) => {
  assert.is(
    tw(({ tag }) => tag('marker')),
    'marker',
  )
  assert.equal(sheet.target, [])
})

test('inline rule (tw)', ({ sheet, tw }) => {
  assert.is(
    tw(({ tw }) => tw`text-center`),
    'text-center',
  )
  assert.equal(sheet.target, ['.text-center{text-align:center}'])
})

test('inline rule (tw combined)', ({ sheet, tw }) => {
  assert.is(
    tw`underline ${({ tw }) => tw`text-center`} font-bold`,
    'underline text-center font-bold',
  )
  assert.equal(sheet.target, [
    '.underline{text-decoration:underline}',
    '.text-center{text-align:center}',
    '.font-bold{font-weight:700}',
  ])
})

test('inline rule (variants)', ({ sheet, tw }) => {
  assert.is(
    tw`text-center sm:hover:${({ tw }) => tw`underline`} active:font-bold`,
    'text-center sm:hover:underline active:font-bold',
  )
  assert.equal(sheet.target, [
    '.text-center{text-align:center}',
    '.active\\:font-bold:active{font-weight:700}',
    '@media (min-width: 640px){.sm\\:hover\\:underline:hover{text-decoration:underline}}',
  ])
})

test('inline rule nested', ({ sheet, tw }) => {
  const underline: InlineDirective = ({ tw }) => tw`underline`

  assert.is(
    tw(
      'text-center',
      {
        sm: {
          hover: underline,
          focus: ({ theme }) => ({ color: theme('colors', 'red.500') }),
        },
        lg: ({ tw }) => tw`text-lg focus:${underline}`,
      },
      'font-bold',
    ),
    'text-center sm:hover:underline sm:focus:tw-1e4d9nh lg:text-lg lg:focus:underline font-bold',
  )

  assert.equal(sheet.target, [
    '.text-center{text-align:center}',
    '.font-bold{font-weight:700}',
    '@media (min-width: 640px){.sm\\:hover\\:underline:hover{text-decoration:underline}}',
    '@media (min-width: 640px){.sm\\:focus\\:tw-1e4d9nh:focus{color:#ef4444}}',
    '@media (min-width: 1024px){.lg\\:text-lg{font-size:1.125rem;line-height:1.75rem}}',
    '@media (min-width: 1024px){.lg\\:focus\\:underline:focus{text-decoration:underline}}',
  ])
})

test('inject @font-face', ({ sheet, tw }) => {
  assert.is(
    tw(() => ({
      '& p': {
        fontFamily: 'Open Sans',
        '@font-face': {
          fontFamily: 'Open Sans',
          src: [
            `url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2")`,
            `url("/fonts/OpenSans-Regular-webfont.woff") format("woff")`,
          ].join(', '),
        },
      },
    })),
    'tw-vqfbxj',
  )

  assert.equal(sheet.target, [
    '@font-face{font-family:Open Sans;src:url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2"), url("/fonts/OpenSans-Regular-webfont.woff") format("woff")}',
    '.tw-vqfbxj p{font-family:Open Sans}',
  ])
})

test('inject global styles', ({ sheet, tw }) => {
  assert.is(
    tw(() => ({
      ':root': {
        '--main-bg-color': 'brown',
      },
      backgroundColor: 'var(--main-bg-color)',
    })),
    'tw-1kfw9fm',
  )

  assert.equal(sheet.target, [
    '.tw-1kfw9fm{background-color:var(--main-bg-color)}',
    '.tw-1kfw9fm :root{--main-bg-color:brown}',
  ])
})

test('expand nested selector', ({ sheet, tw }) => {
  assert.is(
    tw(() => ({
      '&, a': {
        color: 'black',
      },
    })),
    'tw-ec2uk9',
  )

  assert.equal(sheet.target, ['.tw-ec2uk9,.tw-ec2uk9  a{color:black}'])
})

test('fontSize string', ({ sheet }) => {
  const { tw } = create({
    sheet: sheet,
    prefix: false,
    preflight: false,
    mode: strict,
    theme: {
      extend: {
        fontSize: {
          big: '5.75rem',
          'line-height': ['20px', '28px'],
          css: [
            '32px',
            {
              letterSpacing: '-0.02em',
              lineHeight: '40px',
            },
          ],
        },
      },
    },
  })

  assert.is(tw`text(big line-height css)`, 'text-big text-line-height text-css')
  assert.equal(sheet.target, [
    '.text-css{font-size:32px;letter-spacing:-0.02em;line-height:40px}',
    '.text-line-height{font-size:20px;line-height:28px}',
    '.text-big{font-size:5.75rem}',
  ])
})

test('can not call setup after config', ({ setup }) => {
  assert.throws(() => {
    setup()
  }, 'Error: [LATE_SETUP_CALL] {}')
})

test('can call setup once', () => {
  const { setup } = create()
  setup({
    prefix: false,
    preflight: false,
    mode: strict,
  })

  assert.throws(() => {
    setup()
  }, 'Error: [LATE_SETUP_CALL] {}')
})

test.run()
