#include <wchar.h>
#include <stdlib.h>
#include <stddef.h>
#include <stdio.h>
#include <sys/stat.h>
#include <string.h>
#include <limits.h>
#include <locale.h>

/* Maximum default buffer size */
#define MAXSTRSIZE 1000000 /* use 1 million bytes max */

#if (__STDC_VERSION__ >= 199901L)
  /* For C99 and above, include stdint.h and restrict max buffer size */
  #include <stdint.h>
  /* Don't allocate more than 1/3 of SIZE_MAX even if maximum default buffer
   * setting is larger */
  #define DEFSTRSIZE (SIZE_MAX / 3 > MAXSTRSIZE ? MAXSTRSIZE : SIZE_MAX / 3)
  #define Z "z"
  /* Don't cast size_t when printing it since we use C99's %z specifier */
  #define PRTF_SZ_CAST 0 +
#else
  #define DEFSTRSIZE MAXSTRSIZE
  /* Use the largest integral type as a printf specifier for size_t and
   * cast size_t appropriately when doing so */
  #define Z "l"
  #define PRTF_SZ_CAST (unsigned long)
#endif

#define printusage fprintf(stderr, \
"This program takes 3 parameters in this order: \n" \
"filename src dest\n" \
"It overwrites the `src` with `dest` in that file.\n");

#if (__STDC_VERSION__ >= 199901L)
#include <stdint.h>
#endif

/* Source: http://creativeandcritical.net/downloads/wreplacebench.c */
wchar_t *repl_wcs(const wchar_t *str, const wchar_t *from, const wchar_t *to) {

	/* Adjust each of the below values to suit your needs. */

	/* Increment positions cache size initially by this number. */
	size_t cache_sz_inc = 16;
	/* Thereafter, each time capacity needs to be increased,
	 * multiply the increment by this factor. */
	const size_t cache_sz_inc_factor = 3;
	/* But never increment capacity by more than this number. */
	const size_t cache_sz_inc_max = 1048576;

	wchar_t *pret, *ret = NULL;
	const wchar_t *pstr2, *pstr = str;
	size_t i, count = 0;
	#if (__STDC_VERSION__ >= 199901L)
	uintptr_t *pos_cache_tmp, *pos_cache = NULL;
	#else
	ptrdiff_t *pos_cache_tmp, *pos_cache = NULL;
	#endif
	size_t cache_sz = 0;
	size_t cpylen, orglen, retlen, tolen, fromlen = wcslen(from);

	/* Find all matches and cache their positions. */
	while ((pstr2 = wcsstr(pstr, from)) != NULL) {
		count++;

		/* Increase the cache size when necessary. */
		if (cache_sz < count) {
			cache_sz += cache_sz_inc;
			pos_cache_tmp = realloc(pos_cache, sizeof(*pos_cache) * cache_sz);
			if (pos_cache_tmp == NULL) {
				goto end_repl_wcs;
			} else pos_cache = pos_cache_tmp;
			cache_sz_inc *= cache_sz_inc_factor;
			if (cache_sz_inc > cache_sz_inc_max) {
				cache_sz_inc = cache_sz_inc_max;
			}
		}

		pos_cache[count-1] = pstr2 - str;
		pstr = pstr2 + fromlen;
	}

	orglen = pstr - str + wcslen(pstr);

	/* Allocate memory for the post-replacement string. */
	if (count > 0) {
		tolen = wcslen(to);
		retlen = orglen + (tolen - fromlen) * count;
	} else	retlen = orglen;
	ret = malloc((retlen + 1) * sizeof(wchar_t));
	if (ret == NULL) {
		goto end_repl_wcs;
	}

	if (count == 0) {
		/* If no matches, then just duplicate the string. */
		wcscpy(ret, str);
	} else {
		/* Otherwise, duplicate the string whilst performing
		 * the replacements using the position cache. */
		pret = ret;
		wmemcpy(pret, str, pos_cache[0]);
		pret += pos_cache[0];
		for (i = 0; i < count; i++) {
			wmemcpy(pret, to, tolen);
			pret += tolen;
			pstr = str + pos_cache[i] + fromlen;
			cpylen = (i == count-1 ? orglen : pos_cache[i+1]) - pos_cache[i] - fromlen;
			wmemcpy(pret, pstr, cpylen);
			pret += cpylen;
		}
		ret[retlen] = L'\0';
	}

end_repl_wcs:
	/* Free the cache and return the post-replacement string,
	 * which will be NULL in the event of an error. */
	free(pos_cache);
	return ret;
}

// source: https://www.joelonsoftware.com/2001/12/11/back-to-basics/
char* mystrcat( char* dest, char* src )
{
     while ((*dest)) dest++;
     while ((*dest++ = *src++));
     return --dest;
}

/* Converts src from a multibyte string to a wide string, allocating memory for
 * the wide string in the process, and returning that wide string. The memory
 * can be deallocated with free() when no longer required.
 */
wchar_t *conv_mbtowcs(const char *src) {
	size_t len = strlen(src);
	wchar_t *ret;

	/* Get length in wide chars. */
	len = mbsrtowcs(NULL, &src, len+1, NULL);
	if (len == (size_t)(-1)) {
		perror("conv_mbtowcs: mbsrtowcs: encoding error");
		return NULL;
	}

	/* Allocate memory for wide char string based on that length. */
	if ((ret = malloc((len+1)*sizeof(wchar_t))) == NULL) {
		perror("conv_mbtowcs: malloc");
		return NULL;
	}

	/* Now perform the actual multibyte to wide string conversion. */
	mbstowcs(ret, src, len+1);

	return ret;
}

int main(int argc, char **argv){
	FILE *in;
	FILE *out;
	char *mystr = NULL;
	wchar_t *mywstr = NULL;
	wchar_t *oldw, *neww, *newwstr = NULL;
	const char *filename, *locale;
	size_t r;
	long int filelen = DEFSTRSIZE;
	struct stat fileStat;

	/* check if amount of args is correct, otherwise exit */
    if (argc <= 3) {
		fprintf(stderr, "Not enough parameters.\n");
		printusage;
		exit(EXIT_FAILURE);
    }

	/* Locale must be set so that mbstowcs() can interpret multibyte chars
	 * according to that locale. Calling setlocale() with an empty string
	 * causes the locale to be initialised from the environment in which the
	 * program is run i.e. the user's locale, which in a Linux/UNIX
	 * environment is specified in the LC_TYPE or LC_ALL variable.
	 */
	locale = setlocale(LC_CTYPE, "");
	if (!locale)
		perror("setlocale");

	/* Parse and store command-line parameters */
	filename = argv[1];
	oldw = conv_mbtowcs(argv[2]);
	if (!oldw)
		exit(EXIT_FAILURE);
	neww = conv_mbtowcs(argv[3]);
	if (!neww)
		exit(EXIT_FAILURE);

	if(stat(filename, &fileStat) < 0){
		exit(1);
	}

	/* Try to determine the specified file's size so we know how much memory
	 * to malloc. Note firstly that this requires opening the file in binary
	 * mode, and secondly that at least the C89 version of the Standard does
	 * not require that a binary stream supports seeking to the end of a
	 * file. If the seek and tell fail, set the file size to DEFSTRSIZE.
	 */
	in = fopen(filename, "rb");
	if (in == NULL) {
		perror("fopen");
		exit(EXIT_FAILURE);
	}
	if (fseek(in, 0, SEEK_END) > 0 || (filelen = ftell(in)) == -1L) {
		filelen = DEFSTRSIZE;
	}

	/* Allocate enough memory to read in the specified file up to the size
	 * determined above.
	 */
	if ((mystr = malloc(filelen + 1)) == NULL) {
		perror("malloc (for file)");
		exit(EXIT_FAILURE);
	}

	/* Reopen the specified file in text mode. */
	if (freopen(filename, "r", in) == NULL) {
		perror("freopen");
		exit(EXIT_FAILURE);
	}

	/* Read in as much of specified file as possible */
	if ((r = fread(mystr, 1, filelen, in)) == 0) {
		perror("fread");
		exit(EXIT_FAILURE);
	}
	mystr[r] = '\0';
	if (fclose(in) != 0)
		perror("fclose");

	/* Convert file contents from multibyte to wide char. */
	mywstr = conv_mbtowcs(mystr);
	if (!mywstr)
		exit(EXIT_FAILURE);

	/* Free no-longer-required memory for mystr. */
	free(mystr);

	if ((newwstr = repl_wcs(mywstr, oldw, neww)) == NULL)
	fwprintf(stderr, L"Replace returned NULL.\n");

	if (newwstr != NULL) {
		char filename_stage[strlen(argv[1]) + 9];
		char *p = filename_stage;
		filename_stage[0] = '\0';
		p = mystrcat(filename_stage, argv[1]);
		p = mystrcat(filename_stage, ".rewrite");

		out = fopen(filename_stage, "w");
		fwprintf(out, newwstr);

		rename(filename_stage, argv[1]);
		chmod(argv[1], fileStat.st_mode);
		fclose(out);
	}

	/* Free allocated memory */
	/* componentWillUnmount stuff */
	free(oldw);
	free(neww);
	free(newwstr);
	free(mywstr);

	return 0;
}

