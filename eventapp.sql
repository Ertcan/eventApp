PGDMP  "                    |            event    16.3    16.3     �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16445    event    DATABASE     �   CREATE DATABASE event WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE event;
                postgres    false            �            1259    16456    incident    TABLE     �   CREATE TABLE public.incident (
    id integer NOT NULL,
    lat numeric(10,8) NOT NULL,
    lon numeric(11,8) NOT NULL,
    type integer NOT NULL,
    address text,
    image text,
    views integer DEFAULT 0,
    isactive boolean DEFAULT true
);
    DROP TABLE public.incident;
       public         heap    postgres    false            �            1259    16455    incident_id_seq    SEQUENCE     �   CREATE SEQUENCE public.incident_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.incident_id_seq;
       public          postgres    false    218            �           0    0    incident_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.incident_id_seq OWNED BY public.incident.id;
          public          postgres    false    217            �            1259    16465    incidenttypes    TABLE     i   CREATE TABLE public.incidenttypes (
    id integer NOT NULL,
    type character varying(255) NOT NULL
);
 !   DROP TABLE public.incidenttypes;
       public         heap    postgres    false            �            1259    16464    incidenttypes_id_seq    SEQUENCE     �   CREATE SEQUENCE public.incidenttypes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.incidenttypes_id_seq;
       public          postgres    false    220            �           0    0    incidenttypes_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.incidenttypes_id_seq OWNED BY public.incidenttypes.id;
          public          postgres    false    219            �            1259    16447    users    TABLE     �   CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    profile_image text
);
    DROP TABLE public.users;
       public         heap    postgres    false            �            1259    16446    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          postgres    false    216            �           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public          postgres    false    215            %           2604    16459    incident id    DEFAULT     j   ALTER TABLE ONLY public.incident ALTER COLUMN id SET DEFAULT nextval('public.incident_id_seq'::regclass);
 :   ALTER TABLE public.incident ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    218    217    218            (           2604    16468    incidenttypes id    DEFAULT     t   ALTER TABLE ONLY public.incidenttypes ALTER COLUMN id SET DEFAULT nextval('public.incidenttypes_id_seq'::regclass);
 ?   ALTER TABLE public.incidenttypes ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    219    220    220            $           2604    16450    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    215    216    216            �          0    16456    incident 
   TABLE DATA           W   COPY public.incident (id, lat, lon, type, address, image, views, isactive) FROM stdin;
    public          postgres    false    218   �       �          0    16465    incidenttypes 
   TABLE DATA           1   COPY public.incidenttypes (id, type) FROM stdin;
    public          postgres    false    220   �       �          0    16447    users 
   TABLE DATA           F   COPY public.users (id, username, password, profile_image) FROM stdin;
    public          postgres    false    216   �       �           0    0    incident_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.incident_id_seq', 57, true);
          public          postgres    false    217            �           0    0    incidenttypes_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.incidenttypes_id_seq', 5, true);
          public          postgres    false    219            �           0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 3, true);
          public          postgres    false    215            ,           2606    16463    incident incident_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.incident
    ADD CONSTRAINT incident_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.incident DROP CONSTRAINT incident_pkey;
       public            postgres    false    218            .           2606    16470     incidenttypes incidenttypes_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.incidenttypes
    ADD CONSTRAINT incidenttypes_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.incidenttypes DROP CONSTRAINT incidenttypes_pkey;
       public            postgres    false    220            *           2606    16454    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    216            �   �  x��W�n�V]S_�Թw澺3��(
���LH��\ɒ�
ɇt�o�>;��z.IA\Ep`�8�:s��WW!�Ć}Ŵr���(T\�ݶ������j״Ǻ6�Z��dV��o+�nA!�H��V|�JBfb�Kq���c 6DW0��`W�:=�<�bg����C�eK:�K"�
A�#D��|�`&%c")�za���H!�R[B�h���0��,�$=�j*�B1p*2���mӞ�vڷ�i�<�'��\�qѢڒ\�.�A�q��'I4����~��"�_��%�c{�w�n=���?v�m������u��aw�]u�����n{sq}]ׯ�7�n����fH�ϕy���Kށ7��Ǘ%S��\ �i(�Fy2lbA�Dɦ\BF8�?f8��5P���|d�,�ܶ���y:���cu!�
�B&�)���Ϧ���,Ǳ,ÑJ:`�ؔ�Wտ�\2%X4��e(&h�����g";����,N)�h��!rI/FF�%=�XR�[&α�oH\��E'R�L������@��@������hÃ h���;Rv�#��Y��^tGNy���� :�ܑ<�^6�6G���L��B%dC���� r"сb�>�@9��h���A
�	��M#a��L#�B��������&ǢKCUf謇¡�5&�'��5΋�*�@8�$��a��r?>���ʀ��@gƉu���2�R�����%�ƘJ�ވu![T�f�F5g!�?�;k��@5�OZ�#�r�~~���C�M�v�`=�{z"�!�!�c��c�� ���u`�l��#�[�8���E�%s��*��!�L��X����Ԓ��`�R�j��mև��n�8�$8�%����|�b�=
�����:v_�l�K.9��3k��PID�%R���|����0]qTm������mP3d��~n�����WW�����7��w����Cs�������n��o�;6���K(ӳ嫻O�ͻ�]V��,�J�	r*KG���,�/���f- M���g�DL�T�3n�U�u�n�4x����e���
3V��@�9�g����=��'B�g��� �+��Ȑ1z�,1�y L^3�B;ÂJ�w�Do�E��C��W�=��@^��T7��~�;��,(7�@T��G�YA_\��Έ�����zq�8i5��]���������4NN�����X�fOc��YWx����Y9���M�ӆp��EQ0C$nR?���z3t�h�XR�B(��Jf!�g�ߝN�C۪�Mu���N�/��roVV�[@��sst�2xq�����eC]$��g
�+�S	�٤�&�I�g��Q�Ja�ttj�:ٛ�n�x�7J�ӷ� �T�Z04��){u{x{{����Cs�|޴�gBk���r.�N�|��I���<�3��O����a��x��}��4����b��.�����~K�\[�Z,��/M      �   O   x�3�t.J,��2���/O�/��2�t��+.)*M.����2��I�KUH��/.-J�2��O�JM.Q��S(�OL����� 0�      �   6   x�3�L-*)M/*��442���2�LJ-��415�9Ks3K8�-,A�=... df     