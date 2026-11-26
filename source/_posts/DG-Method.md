---
title: DG Method
date: 2026-11-26
permalink: /2026/11/26/DG-Method/
categories:
  - Notes
tags:
  - DG
  - FEM
  - Numerical Analysis
---

> These notes are based on my understanding after reading [1].

## Introduction

This chapter introduces the fundamental concepts and theoretical framework required for the construction and analysis of discontinuous Galerkin (DG) methods. First, for general linear variational problems, it presents the Banach–Nečas–Babuška (BNB) theorem characterizing their well-posedness and explains the stability meaning of the inf-sup condition. Subsequently, it constructs broken polynomial spaces through mesh partitions of the domain and polynomial approximation on elements, introduces concepts such as interface jumps, averages, and broken differential operators, clarifies the basic ideas of DG methods, and establishes the corresponding discrete models. On this basis, centering on the well-posedness of the discrete problem, it establishes an abstract error analysis framework for nonconforming finite element methods, reducing the error of the numerical solution to the best approximation error in the discrete space. Finally, to obtain convergence orders with respect to the mesh size $h$, it introduces the requirements for admissible mesh sequences and establishes inverse inequalities, trace inequalities, and polynomial approximation estimates.

### Well-Posedness for Linear Model Problems

Consider the model problems involved in general finite element problems: let $X$ and $Y$ be Banach spaces, with the particular requirement that $Y$ be reflexive, and consider a general linear variational problem:
$$
\text{Find } u \in X, \text{ s.t. } a(u,w) = \langle f, w \rangle_{Y',Y}, \quad \forall w \in Y, \qquad (1.1)
$$
where $a \in \mathcal{L}(X \times Y; \mathbb{R})$ is bounded and $f \in Y'$.

Equivalently, the operator form is:
$$
\text{Find } u \in X, \text{ s.t. } Au = f \text{ in } Y', \qquad (1.2)
$$
where $A \in \mathcal{L}(X, Y')$, s.t. $\langle Av, w \rangle_{Y',Y} = a(v,w), \forall (v,w) \in X \times Y$.

(1.1) is equivalent to (1.2): (1.1) means that the left-hand side and the right-hand side are equal when tested against all functions in $Y$. Viewing the left-hand side as a functional on $Y$, it is in fact an element of $Y'$ by the boundedness and linearity of $a$; this is precisely the expression in (1.2).

In fact, starting from a PDE model and viewing the differential operator as a linear functional, (1.2) is natural. The reason for introducing the two model languages simultaneously is that (1.1) facilitates an intuitive understanding of FEM computations (e.g., the construction of the mass matrix), whereas (1.2) makes the analysis more general and easier to extend, and the operator language is comparatively better suited to exposition and to describing the essence.

For the study to be meaningful, the model problem must be well-posed, i.e., it admits a unique solution for any $f$ and the solution depends continuously on the right-hand side $f$.

**Theorem 1.1 (The Banach–Nečas–Babuška Theorem).** Let $X$ and $Y$ be Banach spaces, with $Y$ reflexive, $a \in \mathcal{L}(X \times Y, \mathbb{R})$, and $f \in Y'$. Then (1.1) is well-posed if and only if

(i) There is $C_{\mathrm{sta}} > 0$ such that
$$
\forall v \in X, \quad C_{\mathrm{sta}} \|v\|_X \leq \sup_{w \in Y \setminus \{0\}} \frac{a(v,w)}{\|w\|_Y},
$$

(ii) For all $w \in Y$,
$$
(\forall v \in X, \ a(v,w) = 0) \implies (w = 0).
$$

Equivalently, the bounded linear operator $A \in \mathcal{L}(X, Y')$ defined by (1.2) is an isomorphism if and only if:

(i) There is $C_{\mathrm{sta}} > 0$ such that
$$
\forall v \in X, \quad C_{\mathrm{sta}} \|v\|_X \leq \|Av\|_{Y'},
$$

(ii) For all $w \in Y$,
$$
(\forall v \in X, \ \langle Av, w \rangle_{Y',Y} = 0) \implies (w = 0).
$$

Moreover, the following a priori estimate holds true:
$$
\|u\|_X \leq \frac{1}{C_{\mathrm{sta}}} \|f\|_{Y'}.
$$

The detailed proof is omitted here; instead, we only provide supplementary explanations and remarks on the conditions and the theorem.

First, consider the operator form $Au = f$ in $Y'$. Well-posedness is equivalent to the existence and boundedness of $A^{-1}$. By the open mapping theorem, it suffices to prove that $A$ is a continuous linear bijection. The two conditions work as follows:

- Condition (i) implies that $A$ is injective, and for any Cauchy sequence $Av_n$ in $R(A)$ (the range of $A$), the sequence $v_n$ is also a Cauchy sequence in $X$. Since $X$ is complete, it follows that $A(X)$ is a closed set.
- Suppose $R(A)$ is not dense in $Y'$. By the Hahn–Banach theorem, there exists $\phi \in Y''$ with $\phi \neq 0$ such that $\phi|_{R(A)} = 0$. Here, the reflexivity of $Y$ is required. Then there exists $w \in Y$ such that $\langle \phi, g \rangle_{Y'',Y'} = \langle g, w \rangle_{Y',Y}$ for all $g \in Y'$. This contradicts condition (ii).

In fact, the reflexivity of $Y$ implies that the weak$^*$ topology and the weak topology on $Y'$ coincide. It also implies that the closed unit ball $B_Y$ is weakly compact, that is, every bounded set in $Y$ has a weakly convergent subsequence.

Next, we consider the weak formulation model. Condition (i), i.e., the inf-sup condition
$$
\inf_{v \in X \setminus \{0\}} \sup_{w \in Y \setminus \{0\}} \frac{a(v,w)}{\|v\|_X \|w\|_Y} \ge C_{\mathrm{sta}} > 0,
$$
means that for every direction $v$ in $X$, one can find a direction $w$ in $Y$ that can sufficiently detect $v$ in the sense of $a$. In the context of the two-dimensional Euclidean inner product, this means that for any vector in $X$, there exists a vector in $Y$ such that the angle between them is uniformly controlled, so that it is not too close to vertical. Condition (ii) means that, in the sense of $a$, there are no test functions in $Y$ that are meaningless for $X$ (i.e., identically zero); or equivalently, the weak topology on $Y$ induced by $a$ can separate the points in $Y$.

Especially, if $Y = X$ is a Hilbert space, let $w = v$ be the active test function in the inf-sup condition, i.e., $a$ is coercive on $X$, and the sufficient condition is as follows:

**Theorem 1.2 (Lax–Milgram Theorem).** Let $X$ be a Hilbert space, let $a \in \mathcal{L}(X \times X, \mathbb{R})$, and let $f \in X'$. Then problem (1.1) is well-posed if the bilinear form $a$ is coercive on $X$. Equivalently, problem (1.2) is well-posed if the linear operator $A \in \mathcal{L}(X, X')$ is coercive. Moreover, the following a priori estimate holds true:
$$
\|u\|_X \leq \frac{1}{C_{\mathrm{sta}}} \|f\|_{X'}.
$$

### Broken Polynomial Spaces

For a well-posed problem, let us review the standard conforming finite element method: the original problem has $V = X = Y$ being a Hilbert space on a good area $\Omega$, the bilinear form $a \in \mathcal{L}(V \times V, \mathbb{R})$ is continuous and coercive, and the linear functional $f \in V'$ is bounded. The original weak formulation is to find $u \in V$ such that $a(u, v) = \langle f, v \rangle_{V', V}$ for all $v \in V$. We construct a finite-dimensional subspace $V_h \subset V$ and seek $u_h \in V_h$ such that $a(u_h, v_h) = f(v_h)$ for all $v_h \in V_h$.

In this process, there are several essential issues: 1. How to construct $V_h$ to approximate $V$; 2. How to construct the bilinear form as well as the bounded operator $f$ in the discrete sense; 3. To provide an upper bound estimate of the error by means of the approximation properties of the discrete operator and the finite-dimensional space, and further analyze the specific convergence order of the error with respect to the parameter $h$ of the finite-dimensional function space.

Generally, $V_h$ is constructed as a piecewise polynomial space based on a geometric partition of the domain $\Omega$ and familiar polynomial spaces. However, if $V_h$ is not embedded in $V$ (i.e., $V_h \not\subset V$), the discrete weak formulation cannot directly inherit the original definitions of $a$ and $f$.

For instance, in nonconforming finite element methods for the Laplace operator, such as the Crouzeix–Raviart (CR) element on a two-dimensional triangular mesh, $V_h$ ensures the continuity of edge averages between elements. The discrete bilinear operator $a_h$ only employs the piecewise gradient operator, which is sufficient to guarantee the approximation property of $V_h$ to $V$ in the sense of this operator, thereby establishing the error estimate.

Here, we note that if the piecewise polynomials in $V_h$ are completely independent with no coupling between elements, then using only the piecewise gradient operator cannot establish a relationship between boundary information and the element interior information. Next, based on this idea, we first discuss the construction of the discrete function space and the establishment of the discrete model.

For brevity, the definitions of simplicial meshes and general meshes (i.e., general polyhedral meshes) are omitted here. We denote the mesh size by $h = \max_{T \in \mathcal{T}_h} h_T$. To describe the inter-element connection of functions, we introduce the following notation and definitions from the book.

**Definition 1.3 (Mesh faces).** Let $\mathcal{T}_h$ be a mesh of the domain $\Omega$. We say that a (closed) subset $F$ of $\overline{\Omega}$ is a *mesh face* if $F$ has positive $(d-1)$-dimensional Hausdorff measure (in dimension 1, this means that $F$ is nonempty) and if either one of the two following conditions is satisfied:

(i) There are distinct mesh elements $T_1$ and $T_2$ such that $F = \partial T_1 \cap \partial T_2$; in such a case, $F$ is called an *interface*.

(ii) There is $T \in \mathcal{T}_h$ such that $F = \partial T \cap \partial \Omega$; in such a case, $F$ is called a *boundary face*.

Interfaces are collected in the set $\mathcal{F}_h^i$, and boundary faces are collected in the set $\mathcal{F}_h^b$. Henceforth, we set
$$
\mathcal{F}_h := \mathcal{F}_h^i \cup \mathcal{F}_h^b.
$$
Moreover, for any mesh element $T \in \mathcal{T}_h$, the set
$$
\mathcal{F}_T := \{F \in \mathcal{F}_h \mid F \subset \partial T\}
$$
collects the mesh faces composing the boundary of $T$. The maximum number of mesh faces composing the boundary of mesh elements is denoted by
$$
N_\partial := \max_{T \in \mathcal{T}_h} \operatorname{card}(\mathcal{F}_T).
$$
Finally, for any mesh face $F \in \mathcal{F}_h$, we define the set
$$
\mathcal{T}_F := \{T \in \mathcal{T}_h \mid F \subset \partial T\},
$$
and observe that $\mathcal{T}_F$ consists of two mesh elements if $F \in \mathcal{F}_h^i$ and of one mesh element if $F \in \mathcal{F}_h^b$.

**Definition 1.4 (Interface averages and jumps).** Let $v$ be a scalar-valued function defined on $\Omega$ and assume that $v$ is smooth enough to admit on all $F \in \mathcal{F}_h^i$ a possibly two-valued trace. This means that, for all $T \in \mathcal{T}_h$, the restriction $v|_T$ of $v$ to the open set $T$ can be defined up to the boundary $\partial T$. Then, for all $F \in \mathcal{F}_h^i$ and a.e. $x \in F$, the *average* of $v$ is defined as
$$
\{\!\{v\}\!\}_F(x) := \frac{1}{2} \left( v|_{T_1}(x) + v|_{T_2}(x) \right),
$$
and the *jump* of $v$ as
$$
[\![v]\!]_F(x) := v|_{T_1}(x) - v|_{T_2}(x).
$$
When $v$ is vector-valued, the above average and jump operators act component-wise on the function $v$. Whenever no confusion can arise, the subscript $F$ and the variable $x$ are omitted, and we simply write $\{\!\{v\}\!\}$ and $[\![v]\!]$.

**Definition 1.5 (Face normals).** For all $F \in \mathcal{F}_h$ and a.e. $x \in F$, we define the (unit) *normal* $\mathbf{n}_F$ to $F$ at $x$ as

(i) $\mathbf{n}_{T_1}$, the unit normal to $F$ at $x$ pointing from $T_1$ to $T_2$ if $F \in \mathcal{F}_h^i$ with $F = \partial T_1 \cap \partial T_2$; the orientation of $\mathbf{n}_F$ is arbitrary depending on the choice of $T_1$ and $T_2$, but kept fixed in what follows.

(ii) $\mathbf{n}$, the unit outward normal to $\Omega$ at $x$ if $F \in \mathcal{F}_h^b$.

Note that the fixed normal here is generally required to be the outward normal of the boundary element, whereas for inter-element faces, a certain fixed direction is adopted. This choice of direction may be model-dependent, but the sign does not affect the "magnitude" of the jump and average. This is precisely the "weight" of the interface quantities in the model problem.

In addition, the specific definition of mesh faces is given here because, when considering general generated meshes, it is allowed for the endpoints of an interface not to be vertices of the adjacent elements. Therefore, further requirements on the mesh will be necessary when further analyzing the discrete model in the subsequent text.

Under the above general meshes, we now give the definition of a general piecewise polynomial space. Firstly, the local polynomial space $\mathbb{P}_d^k$:

**Definition 1.6 (The Polynomial Space $\mathbb{P}_d^k$).**
$$
\mathbb{P}_d^k = \operatorname{span}\{x_1^{\alpha_1} \cdots x_d^{\alpha_d} : \alpha_i \in \mathbb{N}, \ \alpha_1 + \cdots + \alpha_d \le k\}.
$$
That is, the space of real-coefficient polynomials in $d$ variables with total degree at most $k$.

And the polynomial space on the general mesh $\mathcal{T}_h$:

**Definition 1.7 (The Broken Polynomial Space $\mathbb{P}_d^k(\mathcal{T}_h)$).**
$$
\mathbb{P}_d^k(\mathcal{T}_h) := \{v \in L^2(\Omega) \mid \forall T \in \mathcal{T}_h, \ v|_T \in \mathbb{P}_d^k(T)\}.
$$

Similarly, the corresponding broken polynomial space can also be defined for the tensor-product polynomial space on elements. Functions in this piecewise polynomial space are entirely independent across element interfaces, with no continuity requirements. It is a fully broken assembly.

Following the same idea, one can define the broken Sobolev spaces and the broken gradient.

**Definition 1.8 (Broken Sobolev space).** The broken Sobolev space is defined as
$$
W^{m,p}(\mathcal{T}_h) := \{v \in L^p(\Omega) \mid \forall T \in \mathcal{T}_h, \ v|_T \in W^{m,p}(T)\}.
$$

**Definition 1.9 (Broken gradient).** The broken gradient $\nabla_h : W^{1,p}(\mathcal{T}_h) \to [L^p(\Omega)]^d$ is defined such that, for all $v \in W^{1,p}(\mathcal{T}_h)$,
$$
\forall T \in \mathcal{T}_h, \quad (\nabla_h v)|_T := \nabla(v|_T).
$$

From the definition, the broken gradient operator appears to completely discard the inter-element connection information. In fact, for piecewise smooth functions, it follows from the integration by parts formula that this gradient operator only ignores the possible interface jump terms of the function.

More rigorously, let $v \in W^{1,p}(\mathcal{T}_h)$. Then, for all $\Phi \in [C_0^\infty(\Omega)]^d$, we observe integrating by parts elementwise that
$$
\begin{aligned}
\int_{\Omega} \nabla_h v \cdot \Phi
&= \sum_{T \in \mathcal{T}_h} \int_T \nabla(v|_T) \cdot \Phi \\
&= - \sum_{T \in \mathcal{T}_h} \int_T v (\nabla \cdot \Phi) + \sum_{T \in \mathcal{T}_h} \int_{\partial T} v|_T (\Phi \cdot \mathbf{n}_T) \\
&= - \int_{\Omega} v (\nabla \cdot \Phi) + \sum_{F \in \mathcal{F}_h^i} \int_F (\Phi \cdot \mathbf{n}_F) v
\end{aligned}
$$
since $\Phi$ is continuous across interfaces and vanishes on boundary faces. By rewriting the summation over element boundaries as a summation over the interior faces $F \in \mathcal{F}_h^i$, we obtain the following lemma.

**Lemma 1.10 (Characterization of $W^{1,p}(\Omega)$).** Let $1 \le p \le \infty$. A function $v \in W^{1,p}(\mathcal{T}_h)$ belongs to $W^{1,p}(\Omega)$ if and only if
$$
[\![v]\!]_F = 0, \quad \forall F \in \mathcal{F}_h^i.
$$

For exact solutions that may exhibit interface discontinuities in practice, taking the weak derivative of the aforementioned interface jump terms can produce non-integrable distributions. For instance, the weak gradient of a piecewise constant function consists of Dirac delta functions. Therefore, the definition of the broken gradient is capable of fully capturing the intra-element information even under low regularity, while maintaining a certain degree of smoothness (at least the integrability).

A function space $H(\operatorname{div}; \mathcal{T}_h)$ will be used in the subsequent sections, so we briefly introduce it here.

**Definition 1.11 (Broken $H(\operatorname{div}; \Omega)$).**
$$
H(\operatorname{div}; \Omega) = \{\tau \in [L^2]^d \mid \nabla \cdot \tau \in L^2(\Omega)\}.
$$
The broken $H(\operatorname{div})$ is defined by
$$
H(\operatorname{div}; \mathcal{T}_h) := \{\tau \in [L^2]^d \mid \tau|_T \in H(\operatorname{div}; T), \forall T \in \mathcal{T}_h\}.
$$
The broken divergence operator $\nabla_h \cdot : H(\operatorname{div}; \mathcal{T}_h) \to L^2(\Omega)$ is defined such that, for all $\tau \in H(\operatorname{div}; \mathcal{T}_h)$,
$$
\forall T \in \mathcal{T}_h, \quad (\nabla_h \cdot \tau)|_T := \nabla \cdot (\tau|_T).
$$

Similarly, the characterization of the broken $H(\operatorname{div})$ space is provided as follows.

**Lemma 1.12 (Characterization of $H(\operatorname{div}; \Omega)$).** $\forall \tau \in H(\operatorname{div}; \mathcal{T}_h) \cap [W^{1,1}(\mathcal{T}_h)]^d$, $\tau \in H(\operatorname{div}; \Omega)$ if and only if its normal jump vanishes across all internal faces, i.e.,
$$
[\![\tau \cdot \mathbf{n}]\!]_F = 0, \quad \forall F \in \mathcal{F}_h^i.
$$

Why we need $\tau \in W^{1,1}(\mathcal{T}_h)^d$? Integrating the divergence of $\tau$ by parts over a local element $T$, the regularity of $H(\operatorname{div})$ guarantees the existence of the normal trace $\tau \cdot \mathbf{n}_T$ on $\partial T$, at least in a weak sense. However, when considering the discrete model, the integrals over the contact faces between two general adjacent elements should be treated separately. We require that such an integral exists on any contact face $F \in \mathcal{F}_h(T)$. Therefore, we assume that
$$
\tau \in W^{1,1}(\mathcal{T}_h)^d \cap H(\operatorname{div}; \Omega).
$$

To be more rigorous, one should further analyze the properties of the normal jump. Let us first look at the definition of the trace operator $\gamma: H^1(T) \to H^{1/2}(\partial T)$. If we expect a similar operator for the normal trace, it should naturally satisfy
$$
\langle \sigma \cdot \mathbf{n}_T, g \rangle_{\partial T} = \int_T \sigma \cdot \nabla \tilde{g} + \int_T (\nabla \cdot \sigma) \tilde{g},
$$
where $\tilde{g}$ is the element of minimal $H^1$-norm whose trace is $g$. In this way, we have $\sigma \cdot \mathbf{n}_T \in H^{-1/2}(\partial T)$. Furthermore, if we expect it to be defined on a specific face $F$, i.e., the above holds for all $g \in H^{1/2}(F)$, then additional requirements should be imposed. This is because, although $F$ is a well-behaved subset of $\partial T$, a general function in $H^{1/2}(F)$ cannot be naturally extended by zero to $H^{1/2}(\partial T)$. For instance, if $\partial T$ is a line segment and $F$ is a shorter subsegment, the piecewise constant function on $F$, when directly extended by zero, yields a discontinuous function that does not satisfy the $H^{1/2}$ smoothness on $\partial T$.

For $0 < s < 1$, the fractional Sobolev seminorm is
$$
|v|_{H^s(\Omega)}^2 = \int_\Omega \int_\Omega \frac{|v(x) - v(y)|^2}{|x - y|^{d+2s}} \, dx \, dy.
$$

Even if $v$ is constant within each element, the cross-integrals between different elements may still diverge.

Consider the simplest one-dimensional example:
$$
\Omega = (-1, 1), \quad v(x) = \begin{cases} 0, & x < 0, \\ 1, & x > 0. \end{cases}
$$

Taking $s = \frac{1}{2}$, we have
$$
|v|_{H^{1/2}(-1,1)}^2 = 2 \int_{-1}^0 \int_0^1 \frac{1}{(y - x)^2} \, dy \, dx.
$$

Letting $a = -x$, we obtain
$$
\begin{aligned}
|v|_{H^{1/2}(-1,1)}^2 &= 2 \int_0^1 \int_0^1 \frac{1}{(a + y)^2} \, dy \, da \\
&= 2 \int_0^1 \left( \frac{1}{a} - \frac{1}{a + 1} \right) da \\
&= +\infty.
\end{aligned}
$$

Therefore,
$$
v \notin H^{1/2}(-1, 1).
$$

### Nonconforming Error Analysis

Returning to the original problem (1.2) (or (1.1)), we consider the discrete operator $\langle A_h u_h, w_h \rangle_{Y',Y} = a_h(u_h, w_h)$, and seek $A_h u_h = f_h$ in $Y'$. Here, for simplicity, set test and trial function space be identical; $a_h$ and $f_h$ are discretizations of the original operators to use on $V_h$, and strictly speaking, the inner product here should be the inner product on $V_h$. Let the norm on $V_h$ be denoted by $\left|\!\left|\!\left| \cdot \right|\!\right|\!\right|$, and its extension to $V_h + X$ be denoted by $\left|\!\left|\!\left| \cdot \right|\!\right|\!\right|_*$. The discussion here is entirely abstract; its purpose is to illustrate what is required to construct a DG model and what can be obtained from it.

First, the well-posedness of the discrete problem. According to the BNB theorem, the discrete operator must satisfy the inf-sup condition and the non-degeneracy condition. The inf-sup condition implies that the operator $A_h$ is injective. Furthermore, since $V_h$ is a finite-dimensional space, $A_h$ is also surjective. Therefore, it suffices to ensure that
$$
\|A_h v_h\|_{V_h'} \ge C_{\mathrm{sta}} \left|\!\left|\!\left| v_h \right|\!\right|\!\right|.
$$

The norm $\left|\!\left|\!\left| \cdot \right|\!\right|\!\right|$ of the function space $(V_h, \left|\!\left|\!\left| \cdot \right|\!\right|\!\right|)$ used here should be analogous to the $W^{m,p}$ norm; it should be capable of bounding the magnitudes of functions, gradients, and so on, and it should also allow for extension to $X$ and $Y$.

Second, there should be consistency between the discrete problem and the original problem, namely, the Galerkin orthogonality
$$
a_h(u - u_h, w_h) = 0.
$$

From the perspective of error analysis, the consistency condition is not strictly necessary. We need it because the Galerkin orthogonality it provides allows us to reduce the error to the approximation error of the discrete space. However, if the discrete operator we construct possesses a residual term beyond the consistency condition, and we can prove that this residual tends to zero as the mesh is refined—and furthermore, that it converges at the same order with respect to $h$—then strong consistency is unnecessary. In summary, consistency serves as a tool to ensure that the discrete operator does not deviate significantly from the original operator, and it provides a systematic framework for error analysis.

It should be noted that, since the space $V_h$ does not impose requirements on inter-element connectivity, $a_h$ should be subject to corresponding restrictions. Moreover, $a_h$ should be extendable to $(X^* + V_h) \times V_h$, where $X^*$ is the subspace to which the exact solution belongs. For instance, $X = H_0^1$ and $X^* = H^2 \cap H_0^1$.

Due to the smoothness limitations of $X^*$, for instance, integral terms involving the trace operator may cause $\left|\!\left|\!\left| \cdot \right|\!\right|\!\right|$ to fail to be a valid norm. Therefore, a new norm $\left|\!\left|\!\left| \cdot \right|\!\right|\!\right|_*$ on $X^* + V_h$ is required, and it is naturally required to be compatible with the original norm $\left|\!\left|\!\left| \cdot \right|\!\right|\!\right|$ on $V_h$. This enables us to state the boundedness of $a_h$ as:
$$
a_h(v, w_h) \le C_{\mathrm{bnd}} \left|\!\left|\!\left| v \right|\!\right|\!\right|_* \left|\!\left|\!\left| w_h \right|\!\right|\!\right|.
$$

Building on the Galerkin orthogonality and the structure of the $\left|\!\left|\!\left| \cdot \right|\!\right|\!\right|_*$ norm, we are now in a position to consider the magnitude of $u - u_h$ in this norm.
$$
\begin{aligned}
\left|\!\left|\!\left| u - u_h \right|\!\right|\!\right|_*
&\leq \left|\!\left|\!\left| u - v_h \right|\!\right|\!\right|_* + \left|\!\left|\!\left| u_h - v_h \right|\!\right|\!\right|_* \\
\left|\!\left|\!\left| u_h - v_h \right|\!\right|\!\right|_*
&\leq C_{\mathrm{sta}}^{-1} \sup_{w_h \in V_h} \frac{a_h(u_h - v_h, w_h)}{\left|\!\left|\!\left| w_h \right|\!\right|\!\right|} \\
&= C_{\mathrm{sta}}^{-1} \sup_{w_h \in V_h} \frac{a_h(u - v_h, w_h)}{\left|\!\left|\!\left| w_h \right|\!\right|\!\right|} \\
&\leq C_{\mathrm{sta}}^{-1} C_{\mathrm{bnd}} \left|\!\left|\!\left| u - v_h \right|\!\right|\!\right|_* \\
\Rightarrow \left|\!\left|\!\left| u - u_h \right|\!\right|\!\right|_*
&\leq (1 + C_{\mathrm{sta}}^{-1} C_{\mathrm{bnd}}) \inf_{v_h \in V_h} \left|\!\left|\!\left| u - v_h \right|\!\right|\!\right|_*
\end{aligned}
$$

### $h$-estimate

To obtain more refined error estimates—or, in practice, to understand how much the error is improved by refining the mesh or increasing the polynomial degree of $V_h$—we need to separate the mesh parameters and polynomial degree from the constants in the aforementioned abstract error estimate and the approximation error. Of course, a qualitative discussion is also required on whether the discrete operator retains well-posedness and boundedness as $h \to 0$ and the polynomial degree $p \to \infty$.

**The admissible mesh.** Prior to this, certain restrictions must be imposed on the mesh in order to separate $h$ from $\mathcal{T}_h$.

For ease of discussion, we start with simplicial meshes. For convenience of notation and boundary discussion, we wish to avoid situations where inter-element faces intersect partially. To this end, we define a *matching mesh* as follows:

**Definition 1.13 (Matching Simplicial Mesh).** Let $T = \operatorname{conv}(a_0, \dots, a_d)$ be a simplicial mesh element. The mesh is said to be *matching* if for all $T' \in \mathcal{T}_h$ with $T' \neq T$, the intersection $T \cap T'$ is either the empty set or the convex hull of a subset of the vertices, i.e.,
$$
T \cap T' = \operatorname{conv}(a_{i_1}, \dots, a_{i_k})
$$
for some indices $i_1, \dots, i_k$.

To generalize the properties of simplicial meshes to general meshes, we introduce the following concept for general meshes:

**Definition 1.14 (Matching simplicial submesh).** A general mesh $\mathcal{T}_h$ is said to possess a *matching simplicial submesh* $\mathcal{S}_h$ if:

(i) $\mathcal{S}_h$ is matching;

(ii) For every $S \in \mathcal{S}_h$, there exists a unique $T \in \mathcal{T}_h$ such that $S \subset T$;

(iii) For every $S \in \mathcal{S}_h$ and any face $F' \subset \partial S$, there exists at most one face $F$ of $\mathcal{T}_h$ such that $F'$ is a subface of $F$.

We are now in a position to give a definition of mesh regularity. This serves to isolate the mesh size $h$ and to require that the mesh elements do not become "too narrow".

**Definition 1.15 (Shape and contact regularity).** We say that the mesh sequence $\mathcal{T}_{\mathcal{H}}$ is *shape- and contact-regular* if for all $h \in \mathcal{H}$, $\mathcal{T}_h$ admits a matching simplicial submesh $\mathcal{S}_h$ such that

(i) The mesh sequence $\mathcal{S}_{\mathcal{H}}$ is shape-regular in the usual sense of Ciarlet [92], meaning that there is a parameter $\varrho_1 > 0$, independent of $h$, such that, for all $T' \in \mathcal{S}_h$,
$$
\varrho_1 h_{T'} \leq r_{T'},
$$
where $h_{T'}$ is the diameter of $T'$ and $r_{T'}$ the radius of the largest ball inscribed in $T'$,

(ii) There is a parameter $\varrho_2 > 0$, independent of $h$, such that, for all $T \in \mathcal{T}_h$ and for all $T' \in \mathcal{S}_T$,
$$
\varrho_2 h_T \leq h_{T'}.
$$

The matching submesh is introduced because we seek to generalize the regularity of simplicial meshes. Thus, it is natural to require the shape regularity of the submesh. Moreover, for $h \in \mathcal{H}$, we desire the mesh sequence $\mathcal{T}_h$ to possess uniform regularity. Consequently, certain properties of the matching submesh should also be uniform; for instance, its cardinality must not become arbitrarily large as $h \to 0$, and its regularity constants, which are independent of $h_S$, should also be independent of $h_T$. This is precisely why the contact regularity condition is additionally required. Specifically, we have the following properties.

**Lemma 1.16 (Uniform bounds and geometric comparisons).** Let $\mathcal{T}_{\mathcal{H}}$ be a shape- and contact-regular mesh sequence with parameters $\varrho_1, \varrho_2$. Then, the following properties hold uniformly in $h \in \mathcal{H}$:

(i) **(Bound on submesh cardinality)** For all $T \in \mathcal{T}_h$, the cardinality $\operatorname{card}(\mathcal{S}_T)$ is bounded uniformly in $h$.

(ii) **(Bounds on faces cardinality)** For all $T \in \mathcal{T}_h$, the cardinalities $\operatorname{card}(\mathcal{F}_T)$ and $\operatorname{card}(\mathcal{F}'_T)$, as well as the parameter $N_\partial$ defined by $N_\partial := \max_{T \in \mathcal{T}_h} \operatorname{card}(\mathcal{F}_T)$, are bounded uniformly in $h$. Moreover, for all $F \in \mathcal{F}_h$, the cardinality $\operatorname{card}(\mathcal{F}_F)$ is bounded uniformly in $h$.

(iii) **(Lower bound on face diameters)** For all $T \in \mathcal{T}_h$ and all $F \in \mathcal{F}_T$,
$$
\delta_F \ge \rho_1 \rho_2 h_T,
$$
where $\delta_F$ denotes the diameter of $F$.

(iv) **(Diameter comparison for neighboring elements)** For all $T, T' \in \mathcal{T}_h$ sharing a face $F$,
$$
\min(h_T, h_{T'}) \ge \rho_1 \rho_2 \max(h_T, h_{T'}).
$$

The two regularity conditions control different geometric features. Shape regularity prevents the auxiliary simplices from becoming arbitrarily thin relative to their diameters. However, it does not control their sizes relative to the parent element: a fixed element can be subdivided into increasingly many small, shape-regular simplices. Contact regularity provides this additional control by requiring
$$
\varrho_2 h_T \le h_{T'} \le h_T, \qquad T' \in \mathcal{S}_T.
$$
Together, the two conditions imply that each auxiliary simplex contains a ball of radius at least $\varrho_1 \varrho_2 h_T$. Consequently, each simplex occupies a uniformly positive fraction of the volume available in $T$, and the number of simplices in $\mathcal{S}_T$ is uniformly bounded. This is a local bound; the total number of simplices in $\mathcal{S}_h$ may increase as the mesh is refined.

These assumptions allow estimates on the auxiliary simplices to be expressed in terms of the diameters of the original mesh elements. For example, on a shape-regular simplex $T'$, a polynomial $v \in \mathbb{P}_d^k(T')$ satisfies
$$
\|\nabla v\|_{L^2(T')} \le C(d,k,\varrho_1) \, h_{T'}^{-1} \|v\|_{L^2(T')}.
$$
Contact regularity gives
$$
h_{T'}^{-1} \le \varrho_2^{-1} h_T^{-1}.
$$
Thus, for $v \in \mathbb{P}_d^k(T)$, squaring and summing over $T' \in \mathcal{S}_T$ yields
$$
\|\nabla v\|_{L^2(T)} \le C(d,k,\varrho_1) \, \varrho_2^{-1} h_T^{-1} \|v\|_{L^2(T)}.
$$
The same scale comparison, together with the uniform bounds on the number of subfaces, allows discrete trace estimates to be transferred to the parent mesh. The resulting constants are independent of $h$ and of the particular element $T$, although their dependence on the polynomial degree $k$ must still be examined separately for high-order estimates.

A mesh sequence is admissible if it is shape- and contact-regular and has optimal polynomial approximation properties.

In practice, verifying the aforementioned mesh regularity is difficult. Therefore, a sufficient criterion, called the *star-shaped property with respect to a ball*, is provided here.

**Definition 1.17 (Star-shaped property with respect to a ball).** A polyhedron $P$ is said to possess this property if there exists a ball $B_P \subset P$ such that for all $x \in P$, the convex hull of $x \cup B_P$ is contained in $P$.

Intuitively, this means that from any point in $P$, one can "see" the entire ball. Building upon this property, if we assume that the size of this ball is comparable to that of $T$, then the mesh sequence $\mathcal{T}_{\mathcal{H}}$ satisfies the contact regularity property.

**Inverse and trace inequalities.** We now make the dependence on the element diameter explicit. Throughout this discussion, the polynomial degree $k$ is fixed. Unless otherwise stated, the constants are independent of $h$ and of the particular mesh element, but may depend on $d$, $k$, and the mesh regularity parameters.

We write
$$
V_h = \mathbb{P}_d^k(\mathcal{T}_h) := \left\{ v_h \in L^2(\Omega) : v_h|_T \in \mathbb{P}_d^k(T) \quad \forall T \in \mathcal{T}_h \right\}.
$$
No continuity across mesh faces is imposed.

**Lemma 1.18 (Inverse inequality).** Let $\mathcal{T}_{\mathcal{H}}$ be shape- and contact-regular. There exists $C_{\mathrm{inv}} > 0$ such that
$$
\|\nabla v_h\|_{L^2(T)} \le C_{\mathrm{inv}} h_T^{-1} \|v_h\|_{L^2(T)}
$$
for every $T \in \mathcal{T}_h$ and $v_h \in V_h$. More generally, for each integer $m \ge 0$,
$$
|q|_{H^m(T)} \le C_{\mathrm{inv},m} h_T^{-m} \|q\|_{L^2(T)}, \qquad q \in \mathbb{P}_d^k(T),
$$
where $|q|_{H^0(T)} := \|q\|_{L^2(T)}$.

**Proof.** On a reference simplex, differentiation is a bounded operator on the finite-dimensional polynomial space. Affine scaling and shape regularity therefore give
$$
\|\nabla v_h\|_{L^2(T')}^2 \le C h_{T'}^{-2} \|v_h\|_{L^2(T')}^2
$$
on each $T' \in \mathcal{S}_T$. Consequently,
$$
\begin{aligned}
\|\nabla v_h\|_{L^2(T)}^2
&= \sum_{T' \in \mathcal{S}_T} \|\nabla v_h\|_{L^2(T')}^2 \\
&\le C \varrho_2^{-2} h_T^{-2} \sum_{T' \in \mathcal{S}_T} \|v_h\|_{L^2(T')}^2 \\
&= C \varrho_2^{-2} h_T^{-2} \|v_h\|_{L^2(T)}^2.
\end{aligned}
$$
Higher derivatives are treated in the same way. $\square$

The inverse inequality applies to discrete polynomials. To estimate traces of general functions, including approximation errors, we also need a continuous trace inequality.

**Lemma 1.19 (Continuous trace inequality).** Let $\mathcal{T}_{\mathcal{H}}$ be shape- and contact-regular. For every $T \in \mathcal{T}_h$, $F \in \mathcal{F}_T$, and $v \in H^1(T)$,
$$
\|v\|_{L^2(F)}^2 \le C_{\mathrm{tr,c}}^2 \left( h_T^{-1} \|v\|_{L^2(T)}^2 + h_T \|\nabla v\|_{L^2(T)}^2 \right).
$$
Here $C_{\mathrm{tr,c}}$ depends only on the dimension and the mesh regularity parameters.

**Proof.** For each $F' \in \mathcal{F}_F$, let $T' \in \mathcal{S}_T$ be its adjacent simplex. Scaling the trace inequality from a reference simplex yields
$$
\|v\|_{L^2(F')}^2 \le C \left( h_{T'}^{-1} \|v\|_{L^2(T')}^2 + h_{T'} \|\nabla v\|_{L^2(T')}^2 \right).
$$
Using $\varrho_2 h_T \le h_{T'} \le h_T$ and summing over the subfaces proves the assertion. In this sum, each simplex occurs at most $d+1$ times. $\square$

Combining these two inequalities removes the gradient term when the function is a discrete polynomial.

**Lemma 1.20 (Discrete trace inequality).** Under the same mesh assumptions,
$$
h_T^{1/2} \|v_h\|_{L^2(F)} \le C_{\mathrm{tr}} \|v_h\|_{L^2(T)}
$$
for every $T \in \mathcal{T}_h$, $F \in \mathcal{F}_T$, and $v_h \in V_h$.

**Proof.** The continuous trace and inverse inequalities imply
$$
\begin{aligned}
\|v_h\|_{L^2(F)}^2
&\le C_{\mathrm{tr,c}}^2 \left( h_T^{-1} \|v_h\|_{L^2(T)}^2 + h_T \|\nabla v_h\|_{L^2(T)}^2 \right) \\
&\le C_{\mathrm{tr,c}}^2 (1 + C_{\mathrm{inv}}^2) h_T^{-1} \|v_h\|_{L^2(T)}^2.
\end{aligned}
$$
Thus one may take
$$
C_{\mathrm{tr}} = C_{\mathrm{tr,c}} \sqrt{1 + C_{\mathrm{inv}}^2}.
$$
This argument establishes the required $h$-scaling; it does not necessarily give a sharp dependence on $k$. $\square$

**Polynomial approximation.** The preceding inequalities control discrete functions. To estimate the error, we must also approximate the exact solution by such functions.

**Definition 1.21 (Optimal polynomial approximation).** A mesh sequence has optimal polynomial approximation properties if, for each $k \ge 0$ and each mesh element $T$, there exists a linear operator
$$
\mathcal{I}_T^k : L^2(T) \longrightarrow \mathbb{P}_d^k(T)
$$
such that, for all integers $0 \le m \le s \le k+1$,
$$
|v - \mathcal{I}_T^k v|_{H^m(T)} \le C_{\mathrm{app}} h_T^{s-m} |v|_{H^s(T)}, \qquad v \in H^s(T).
$$
The constant is uniform in $h$ and $T$, but may depend on $k$, $s$, and $m$.

For computations and analysis, a convenient choice of approximating operator is the local $L^2$-orthogonal projector
$$
\pi_T^k : L^2(T) \longrightarrow \mathbb{P}_d^k(T),
$$
defined by
$$
\int_T (v - \pi_T^k v) q \, dx = 0 \qquad \forall q \in \mathbb{P}_d^k(T).
$$
The broken projector is defined elementwise by
$$
(\pi_h^k v)|_T = \pi_T^k(v|_T).
$$

**Lemma 1.22 (Approximation by the $L^2$-projector).** On an admissible mesh sequence, for all integers $0 \le m \le s \le k+1$,
$$
|v - \pi_T^k v|_{H^m(T)} \le C h_T^{s-m} |v|_{H^s(T)}, \qquad v \in H^s(T).
$$

**Proof.** Set $q = \mathcal{I}_T^k v$. Since $\pi_T^k q = q$, we have
$$
v - \pi_T^k v = (v - q) - \pi_T^k(v - q).
$$
The higher-order inverse inequality and the $L^2$-stability of the projector give
$$
\begin{aligned}
|v - \pi_T^k v|_{H^m(T)}
&\le |v - q|_{H^m(T)} + C h_T^{-m} \|\pi_T^k(v - q)\|_{L^2(T)} \\
&\le |v - q|_{H^m(T)} + C h_T^{-m} \|v - q\|_{L^2(T)} \\
&\le C h_T^{s-m} |v|_{H^s(T)}.
\end{aligned}
$$
$\square$

**Approximation on mesh faces.** Let $e = v - \pi_T^k v$. For $1 \le s \le k+1$, the continuous trace inequality yields
$$
\begin{aligned}
\|e\|_{L^2(F)}^2
&\le C \left( h_T^{-1} \|e\|_{L^2(T)}^2 + h_T |e|_{H^1(T)}^2 \right) \\
&\le C \left( h_T^{2s-1} + h_T^{2s-1} \right) |v|_{H^s(T)}^2.
\end{aligned}
$$
Hence
$$
\|v - \pi_T^k v\|_{L^2(F)} \le C h_T^{s-\frac{1}{2}} |v|_{H^s(T)}.
$$
If $2 \le s \le k+1$, applying the same argument to each component of $\nabla e$ gives
$$
\|\nabla(v - \pi_T^k v) \cdot n_T\|_{L^2(F)} \le C h_T^{s-\frac{3}{2}} |v|_{H^s(T)}.
$$
The continuous trace inequality is essential here: the error $v - \pi_T^k v$ is generally not a polynomial, so the discrete trace inequality cannot be applied to it.

**Consequences for $h$-estimates.** Define the broken Sobolev seminorm by
$$
|w|_{H^m(\mathcal{T}_h)}^2 := \sum_{T \in \mathcal{T}_h} |w|_{H^m(T)}^2.
$$
Summing the local approximation estimates gives
$$
|v - \pi_h^k v|_{H^m(\mathcal{T}_h)}^2 \le C \sum_{T \in \mathcal{T}_h} h_T^{2(s-m)} |v|_{H^s(T)}^2.
$$
In particular, with $h = \max_{T \in \mathcal{T}_h} h_T$ and $v \in H^s(\Omega)$,
$$
|v - \pi_h^k v|_{H^m(\mathcal{T}_h)} \le C h^{s-m} |v|_{H^s(\Omega)}.
$$
For $s = k+1$, this gives approximation orders $h^{k+1}$ in $L^2(\Omega)$ and $h^k$ in the broken $H^1$-seminorm.

These estimates can now be inserted into an abstract bound of the form
$$
\|u - u_h\|_h \le C_{\mathrm{stab}} \inf_{v_h \in V_h} \|u - v_h\|_{h,*} \le C_{\mathrm{stab}} \|u - \pi_h^k u\|_{h,*}.
$$
The local volume and face estimates determine the powers of $h$ in the last term. A convergence estimate with an $h$-independent constant additionally requires uniform discrete stability. Uniformity as $k \to \infty$ requires a separate analysis of the degree dependence of all constants.

## DG Method for the Poisson Equation

### Problem Description

As a model problem, we consider the Poisson equation with homogeneous Dirichlet boundary conditions:
$$
-\Delta u = f \quad \text{in } \Omega, \qquad u = 0 \quad \text{on } \partial\Omega,
$$
where $\Omega \subset \mathbb{R}^d$ ($d \in \{2,3\}$) is a polyhedral domain and $f \in L^2(\Omega)$. The standard weak formulation of this problem is to seek $u \in H_0^1(\Omega)$ such that
$$
\int_\Omega \nabla u \cdot \nabla v \, dx = \int_\Omega f v \, dx, \quad \forall v \in V = H_0^1(\Omega).
$$

Introducing the diffusive flux $\sigma := -\nabla u$, the original equation can be described in the mixed form of a first-order system of partial differential equations:
$$
\begin{aligned}
\sigma + \nabla u &= 0 \quad \text{in } \Omega, \\
\nabla \cdot \sigma &= f \quad \text{in } \Omega.
\end{aligned}
$$
Since $u \in V$, it follows that for any face $F$ on $\overline{\Omega}$, the trace $u|_F \in L^2(F)$. Further assuming that $u \in W^{2,1}(\mathcal{T}_h) \cap V$, by Lemma 1.10 we have $[\![u]\!] = 0$ for all $F \in \mathcal{F}_h^i$ and $\sigma \cdot \mathbf{n}_F = 0$ for all $F \in \mathcal{F}_h^i$. Further assuming that $u \in V^* = V \cap H^2(\Omega)$, then $\sigma_{\partial T}|_F \in L^2(F)$.

For the DG discretization, we use the broken polynomial space $V_h = \mathbb{P}_d^k(\mathcal{T}_h)$ defined previously, which imposes no inter-element continuity. The discrete problem consists in finding $u_h \in V_h$ such that
$$
a_h(u_h, v_h) = \int_\Omega f v_h \, dx, \quad \forall v_h \in V_h.
$$

The next step is to construct a well-posed discrete operator, such that it can be extended to the space $V_{*h} = V^* + V_h$ and exhibits an approximation property for $u$ as the mesh parameter $h$ is refined. According to the BNB theorem, it suffices to ensure that $a_h$ satisfies the inf-sup condition (on $V_h$). As established in the abstract error analysis above, directly guaranteeing the consistency of the discrete operator (i.e., the Galerkin orthogonality) is sufficient to ensure the convergence order of the error.

### SIP

First, we start from the broken gradient. Let $a_h^{(0)}(v, w_h) = (\nabla_h v, \nabla_h w_h)$ on $V_h^* \times V_h$. This choice is motivated by the fact that the broken gradient is consistent with the original problem and captures the intra-element information. Although it cannot reflect the full information of the equation on $V_h$, it is certainly a "correct" component. We can modify $a_h^{(0)}$ using other constraints.

A straightforward idea is to ensure convergence first; more ideally, we hope that $a_h$ fully satisfies consistency. In this case, substituting the exact solution $u$ into $a_h^{(0)}$, we obtain:
$$
a_h^{(0)}(u, w_h) = -\sum_{T \in \mathcal{T}_h} \int_T (\Delta u) w_h + \sum_{T \in \mathcal{T}_h} \int_{\partial T} (\nabla u \cdot \mathbf{n}_T) w_h. \qquad (2.1)
$$
By replacing the summation over $\partial T$ with the summation over faces $F \in \mathcal{F}_h$, and separating the test and trial functions, we obtain:
$$
\begin{aligned}
a_h^{(0)}(v, w_h)
&= -\sum_{T \in \mathcal{T}_h} \int_T (\Delta v) w_h + \sum_{F \in \mathcal{F}_h} \int_F \{\!\!\{\nabla_h v\}\!\!\} \cdot \mathbf{n}_F [\![w_h]\!] \\
&\quad + \sum_{F \in \mathcal{F}_h^i} \int_F [\![\nabla_h v]\!] \cdot \mathbf{n}_F \{\!\!\{w_h\}\!\!\}.
\end{aligned}
$$
An important tool is used here:
$$
[\![uv]\!] = [\![u]\!]\{\!\!\{v\}\!\!\} + \{\!\!\{u\}\!\!\}[\![v]\!].
$$
Its proof requires only the definitions and simple algebraic operations. This identity formally separates $u$ and $v$ within the jump of $uv$. Moreover, formally, if the jump term is viewed as the rate of change across the interface, it is consistent with the product rule for derivatives: $(uv)' = u'v + uv'$. This is also a characterization of the interface jump: it reflects the rate of change near the interface and thus possesses properties akin to those of derivatives.

Returning to (2.1), it reveals the gap between $a_h^{(0)}$ and the consistency requirement: it has an extra term $\sum_{T \in \mathcal{T}_h} \int_{\partial T} (\nabla u \cdot \mathbf{n}_T) w_h$. To address this, the most direct approach is to construct $a_h^{(1)} = a_h^{(0)} - \sum_{T \in \mathcal{T}_h} \int_{\partial T} (\nabla u \cdot \mathbf{n}_T) w_h$. Then, by using the equivalent form of this summation and the fact that the interface jump of $u$ is zero, we obtain
$$
a_h^{(1)}(v, w_h) := \int_\Omega \nabla_h v \cdot \nabla_h w_h - \sum_{F \in \mathcal{F}_h} \int_F \{\!\!\{\nabla_h v\}\!\!\} \cdot \mathbf{n}_F [\![w_h]\!]. \qquad (2.2)
$$

What is missing between consistency and convergence is the inf-sup condition of the operator $a_h$ on $V_h \times V_h$, as well as its boundedness on $V_h^* \times V_h$. Naturally, these constraints should be established under a reasonable topological structure induced by a discrete norm. The idea in the book is to construct an ideal symmetric bilinear operator and attempt to ensure its coercivity. Subsequently, inspired by the operator form, a discrete norm that can be extended to $V_h^*$ is introduced. Under the symmetry constraint in finite-dimensional spaces, coercivity is equivalent to the positive definiteness of the bilinear operator; under the guarantee of positive definiteness, the bilinear operator can naturally construct a norm on $V_h$, which also provides a clue for extending the norm to $V_h^*$. In short, we first ensure the symmetry of the operator, then its positive definiteness, provide the norm structure, and finally prove its boundedness.

**Symmetry.** Symmetry offers several advantageous properties. Numerically, symmetry implies that the discrete system is symmetric, which facilitates the reduction of computational complexity compared to general matrices. In terms of error analysis, symmetry means that Nitsche's trick is applicable, which serves as a sufficient condition for deriving optimal $L^2$ error estimates. From the perspective of approximating the original problem, it ensures that the discrete operator preserves the symmetric structure of the original operator. If positive definiteness is also present, then the discrete problem is equivalent to an energy functional minimization problem on the discrete space $V_h$:
$$
u_h = \mathop{\mathrm{arg\,min}}_{v_h} \left\{ \frac{1}{2} a_h(v_h, v_h) - \ell(v_h) \right\}.
$$
From the perspective of eigenvalue computation, preserving the symmetry of the original operator ensures that the discrete spectral structure also exhibits some spectral properties brought by symmetry, namely positive eigenvalues and orthogonal eigenvectors.

Observing $a_h^{(1)}$, the most direct way to endow it with symmetry is to add the term $-\sum_{F \in \mathcal{F}_h} \int_F [\![v]\!] \{\!\!\{\nabla_h w_h\}\!\!\} \cdot \mathbf{n}_F$, yielding
$$
a_h^{\mathrm{cs}}(v, w_h) := \int_{\Omega} \nabla_h v \cdot \nabla_h w_h - \sum_{F \in \mathcal{F}_h} \int_F \left( \{\!\!\{\nabla_h v\}\!\!\} \cdot \mathbf{n}_F [\![w_h]\!] + [\![v]\!] \{\!\!\{\nabla_h w_h\}\!\!\} \cdot \mathbf{n}_F \right).
$$
Since $[\![u]\!]_F = 0$ for all $F \in \mathcal{F}_h$, this added term maintains consistency.

## References

[1] D. A. Di Pietro and A. Ern, *Mathematical Aspects of Discontinuous Galerkin Methods*, Mathématiques & Applications, vol. 69, Springer, 2012.
